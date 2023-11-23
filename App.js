import React, { useEffect, useState } from "react";
import { gettingLogicDriver } from "./utils/gettingLogicDriver";
import { info, success } from "./utils/toastWrapper";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

const logicDriver = await gettingLogicDriver(
  "0x0800004135e7e1ef07785e1c1158cf3260048501a639b595cc9f24b690e8ed97e795b3"
);

function App() {
  const [todoName, setTodoName] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getTodos();
  }, []);

  const handleTodoName = (e) => {
    setTodoName(e.currentTarget.value);
  };

  const handleDueDate = (e) => {
    setDueDate(e.currentTarget.value);
  };

  const handlePriority = (e) => {
    setPriority(e.currentTarget.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.currentTarget.value);
  };

  const getTodos = async () => {
    try {
      const tTodos = await logicDriver.persistentState.get("todos");
      setTodos(tTodos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const add = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      info("Adding ...");

      const todoData = {
        name: todoName,
        completed: false,
        dueDate: dueDate,
        priority: priority,
      };

      const ix = await logicDriver.routines.Add([todoData]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });

      await ix.wait();
      await getTodos();
      success("Successfully Added");
      setTodoName("");
      setDueDate("");
      setPriority("medium");
      setAdding(false);
    } catch (error) {
      console.log(error);
    }
  };
  

  const markCompleted = async (id) => {
    try {
      setMarking(id);
      const ix = await logicDriver.routines.MarkTodoCompleted([id]).send({
        fuelPrice: 1,
        fuelLimit: 1000,
      });
      await ix.wait();

      const tTodos = [...todos];
      tTodos[id].completed = true;
      setTodos(tTodos);
      setMarking(false);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredTodos = todos.filter((todo) =>
    todo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Toaster />
      <section className="section-center">
        <form className="todo-form">
          <p className="alert"></p>
          <h3>Todo buddy</h3>
          <div className="form-control">
            <input
              value={todoName}
              name="todoName"
              onChange={handleTodoName}
              type="text"
              id="todo"
              placeholder="e.g. Attend Moi Event"
            />
            <input
              value={dueDate}
              name="dueDate"
              onChange={handleDueDate}
              type="date"
              id="dueDate"
              placeholder="Due Date"
            />
            <select
              value={priority}
              name="priority"
              onChange={handlePriority}
              id="priority"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              value={searchTerm}
              name="searchTerm"
              onChange={handleSearch}
              type="text"
              id="search"
              placeholder="Search..."
            />
            <button onClick={add} type="submit" className="submit-btn">
              {adding ? (
                <Loader color={"#000"} loading={adding} />
              ) : (
                "Add Todo"
              )}
            </button>
          </div>
        </form>
        {!loading ? (
          <div className="todo-container show-container">
            {filteredTodos.map((todo, index) => {
              return (
                <div className="todo-list" key={index}>
                  {todo.name}
                  {todo.completed ? (
                    <img className="icon" src="/images/check.svg" alt="Completed" />
                  ) : (
                    <span
                      onClick={() => markCompleted(index)}
                      className="underline text-red pointer"
                    >
                      {marking === index ? (
                        <Loader color={"#000"} loading={marking === 0 ? true : marking} />
                      ) : (
                        "Mark Completed!"
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <Loader color={"#000"} loading={loading} />
          </div>
        )}
      </section>
    </>
  );
}

export default App;
