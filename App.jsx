import React, { useState, useEffect } from "react";
import "./App.css";

// Sample CS courses
const COURSES = [
  { id: "CS101", name: "Data Structures" },
  { id: "CS102", name: "Algorithms" },
  { id: "CS103", name: "Operating Systems" },
  { id: "CS104", name: "Databases" },
  { id: "CS105", name: "Computer Networks" },
];

const STORAGE_KEY = "campus_portal_v1";

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = { students: {}, employees: { E1001: { empId: "E1001", name: "Prof. Alice", password: "emp123" } } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return { students: {}, employees: {} };
  }
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export default function App() {
  const [db, setDb] = useState(() => loadDB());
  const [view, setView] = useState("auth"); // auth | register | student | employee | enroll
  const [role, setRole] = useState("student");
  const [authUser, setAuthUser] = useState(null);

  // Auth fields
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => saveDB(db), [db]);

  function alertMsg(msg) {
    alert(msg);
  }

  // Registration
  function registerStudent() {
    if (!regNo || !name || !password) return alertMsg("Fill all fields!");
    if (db.students[regNo]) return alertMsg("Register number exists!");
    const s = { regNo, name, password, enrolled: [], paymentStatus: "unpaid" };
    setDb({ ...db, students: { ...db.students, [regNo]: s } });
    alertMsg("Registered successfully. Now login.");
    setView("auth");
  }

  // Login
  function login() {
    if (role === "student") {
      const s = db.students[regNo];
      if (!s || s.password !== password) return alertMsg("Invalid student login");
      setAuthUser({ type: "student", id: regNo });
      setView("student");
    } else {
      const e = db.employees[regNo];
      if (!e || e.password !== password) return alertMsg("Invalid employee login");
      setAuthUser({ type: "employee", id: regNo });
      setView("employee");
    }
  }

  function logout() {
    setAuthUser(null);
    setView("auth");
  }

  // Enrollment
  function enroll(selected) {
    const s = db.students[authUser.id];
    setDb({
      ...db,
      students: { ...db.students, [s.regNo]: { ...s, enrolled: selected, paymentStatus: "unpaid" } },
    });
    setView("student");
  }

  function pay() {
    const s = db.students[authUser.id];
    setDb({
      ...db,
      students: { ...db.students, [s.regNo]: { ...s, paymentStatus: "paid" } },
    });
  }

  // Employee set payment
  function setPayment(reg, status) {
    const s = db.students[reg];
    setDb({
      ...db,
      students: { ...db.students, [reg]: { ...s, paymentStatus: status } },
    });
  }

  // Views
  if (view === "auth") {
    return (
      <div className="app-container">
        <div className="card">
          <h2>Campus Portal Login</h2>
          <div className="flex">
            <button className={role === "student" ? "" : "secondary"} onClick={() => setRole("student")}>Student</button>
            <button className={role === "employee" ? "" : "secondary"} onClick={() => setRole("employee")}>Employee</button>
          </div>
          <input placeholder={role === "student" ? "Register No" : "Employee ID"} value={regNo} onChange={e => setRegNo(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex">
            <button onClick={login}>Login</button>
            {role === "student" && <button className="secondary" onClick={() => setView("register")}>Register</button>}
          </div>
        </div>
      </div>
    );
  }

  if (view === "register") {
    return (
      <div className="app-container">
        <div className="card">
          <h2>Student Registration</h2>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Register No" value={regNo} onChange={e => setRegNo(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex">
            <button onClick={registerStudent}>Register</button>
            <button className="secondary" onClick={() => setView("auth")}>Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "student") {
    const s = db.students[authUser.id];
    return (
      <div className="app-container">
        <div className="card flex flex-col">
          <h2>Student Dashboard</h2>
          <p><b>{s.name}</b> — {s.regNo}</p>
          <p>Enrolled: {s.enrolled.length > 0 ? s.enrolled.join(", ") : "None"}</p>
          <p>Payment: {s.paymentStatus}</p>
          <div className="flex">
            <button onClick={() => setView("enroll")}>Enroll Courses</button>
            {s.enrolled.length > 0 && s.paymentStatus !== "paid" && <button onClick={pay}>Pay Now</button>}
            <button className="secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "enroll") {
    const s = db.students[authUser.id];
    const [selected, setSelected] = useState(s.enrolled);

    function toggle(id) {
      if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
      else if (selected.length < 5) setSelected([...selected, id]);
      else alertMsg("Max 5 courses!");
    }

    return (
      <div className="app-container">
        <div className="card">
          <h2>Course Enrollment</h2>
          {COURSES.map(c => (
            <div key={c.id}>
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /> {c.name}
            </div>
          ))}
          <div className="flex">
            <button onClick={() => enroll(selected)}>Save</button>
            <button className="secondary" onClick={() => setView("student")}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "employee") {
    const e = db.employees[authUser.id];
    const students = Object.values(db.students);
    return (
      <div className="app-container">
        <div className="card">
          <h2>Employee Dashboard</h2>
          <p>{e.name} — {e.empId}</p>
          <table className="table">
            <thead>
              <tr><th>Reg No</th><th>Name</th><th>Courses</th><th>Payment</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.regNo}>
                  <td>{s.regNo}</td>
                  <td>{s.name}</td>
                  <td>{s.enrolled.join(", ")}</td>
                  <td>{s.paymentStatus}</td>
                  <td>
                    <button onClick={() => setPayment(s.regNo,"paid")}>Mark Paid</button>
                    <button className="secondary" onClick={() => setPayment(s.regNo,"unpaid")}>Mark Unpaid</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}