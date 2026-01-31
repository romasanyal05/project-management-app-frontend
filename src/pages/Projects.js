import { useState, useEffect } from "react";

export default function Projects() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchProjects = async () => {
  const res = await fetch("http://localhost:5000/projects");
  const data = await res.json();
  setProjects(data);
};

const loadProjects = fetchProjects;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState([]);

  const [editId, setEditId] = useState(null);

  // 🔹 PER PROJECT MEMBER EMAIL
  const [memberEmails, setMemberEmails] = useState({});

  // ======================
  // FETCH PROJECTS
  // ======================
  useEffect(() => {
    fetch("http://localhost:5000/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  // ======================
  // CREATE / UPDATE PROJECT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      alert("Fill all fields");
      return;
    }

    if (editId) {
      // UPDATE
      const res = await fetch(`http://localhost:5000/projects/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });

      const data = await res.json();

      setProjects(
        projects.map(p => p.id === editId ? data : p)
      );

      setEditId(null);
    } else {
      // CREATE
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      });

      const data = await res.json();
      setProjects([...projects, data.project]);
    }

    setTitle("");
    setDescription("");
  };

  // ======================
  // DELETE PROJECT
  // ======================
  const deleteProject = async (id) => {
    await fetch(`http://localhost:5000/projects/${id}`, {
      method: "DELETE"
    });

    setProjects(projects.filter(p => p.id !== id));
  };

  // ======================
  // ADD MEMBER
  // ======================
  const addMember = async (projectId) => {

    const email = memberEmails[projectId];

    if (!email) {
      alert("Enter email");
      return;
    }

    const res = await fetch(
      `http://localhost:5000/projects/${projectId}/add-member`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      }
    );

    const data = await res.json();
    fetchProjects();

    setProjects(
      projects.map(p => p.id === projectId ? data : p)
    );

    setMemberEmails({
      ...memberEmails,
      [projectId]: ""
    });
  };

const updateRole = async (projectId, email, role) => {
  const res = await fetch(
    `http://localhost:5000/projects/${projectId}/update-role`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role })
    }
  );

  const data = await res.json();

  setProjects(
    projects.map(p => p.id === projectId ? data : p)
  );
};

  const removeMember = async (projectId, email) => {
  await fetch(`http://localhost:5000/projects/${projectId}/remove-member`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  loadProjects();   // list refresh
};

  // ======================
  // UI
  // ======================
  return (
    <div style={{ padding: "30px" }}>

      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          {editId ? "Update" : "Create"}
        </button>

      </form>

      <hr />

      <h3>Projects List</h3>

      <ul>

        {projects.map(p => (

          <li key={p.id}>

            <b>{p.title}</b> - {p.description}

            <br /><br />

            {/* MEMBER INPUT */}
            <input
              type="email"
              placeholder="Enter member email"
              value={memberEmails[p.id] || ""}
              onChange={(e) =>
                setMemberEmails({
                  ...memberEmails,
                  [p.id]: e.target.value
                })
              }
            />

            <button onClick={() => addMember(p.id)}>
              Add Member
            </button>

            {/* SHOW MEMBERS */}
            {p.team_members && (
  <ul>
    {p.team_members.map((m, i) => (
      <li key={i}>
  {m}

  {/* ROLE DROPDOWN */}
  {currentUser?.role === "admin" && (
  <>
    <label style={{ marginLeft: "10px", fontWeight: "bold" }}>
      Role:
    </label>

    <select
      value={p.member_roles?.[m] || "user"}
      onChange={(e) => {
        if (window.confirm("Change role of this member?")) {
          updateRole(p.id, m, e.target.value);
        }
      }}
      style={{
        marginLeft: "5px",
        padding: "4px",
        borderRadius: "5px",
        border: "1px solid gray",
        backgroundColor:
          p.member_roles?.[m] === "admin" ? "#ffeaa7" : "#dfe6e9"
      }}
    >
      <option value="admin">👑 Admin</option>
      <option value="user">👤 User</option>
    </select>
  </>
)}
  {/* REMOVE BUTTON */}
  {currentUser?.role === "admin" && (
  <button onClick={() => removeMember(p.id, m)}>
    Remove
  </button>
  )}
</li>
        
    ))}
  </ul>
)}
{currentUser?.role === "admin" && (
                <button onClick={() => deleteProject(p.id)}>
              Delete
            </button>
)}

            <button onClick={() => {
              setEditId(p.id);
              setTitle(p.title);
              setDescription(p.description);
            }}>
              Edit
            </button>

            <hr />

          </li>

        ))}

      </ul>

    </div>
  );
}