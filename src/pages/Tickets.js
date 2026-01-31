import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tickets() {

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});

  const [editId, setEditId] = useState(null);
const [editTitle, setEditTitle] = useState("");
const [editDesc, setEditDesc] = useState("");
const [assignedTo, setAssignedTo] = useState("");
const [editAssigned, setEditAssigned] = useState("");

  const projectId = 4;
  const statuses = ["open", "inprogress", "review", "completed"];

  // ================= LOAD TICKETS =================
  useEffect(() => {
    fetch(`http://localhost:5000/tickets/project/${projectId}`)
      .then(res => res.json())
      .then(data => setTickets(data));
  }, []);

  // ================= CREATE TICKET =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
        project_id: projectId,
        assigned_to: assignedTo
      })
    });

    const data = await res.json();
    setTickets([...tickets, data]);

    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  // ================= DELETE TICKET =================
  const deleteTicket = async (id) => {
    await fetch(`http://localhost:5000/tickets/${id}`, {
      method: "DELETE"
    });

    setTickets(tickets.filter(t => t.id !== id));
  };

  const startEdit = (ticket) => {
  setEditId(ticket.id);
  setEditTitle(ticket.title);
  setEditDesc(ticket.description);
  setEditAssigned(ticket.assigned_to || "");
};

const saveEdit = async (id) => {

  const currentTicket = tickets.find((ticket) => ticket.id === id);

  if (!currentTicket) {
    alert("Ticket not found");
    return;
  }

  const res = await fetch(`http://localhost:5000/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: editTitle,
      description: editDesc,
      status: currentTicket.status,
      priority: currentTicket.priority,
      assigned_to: editAssigned
    })
  });

  const data = await res.json();

  setTickets(
    tickets.map((ticket) =>
      ticket.id === id ? data : ticket
    )
  );

  setEditId(null);
};
  // ================= UPDATE STATUS =================
 const updateStatus = async (id, status) => {

  const ticket = tickets.find(t => t.id === id);

  const res = await fetch(`http://localhost:5000/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: status
    })
  });

  const data = await res.json();

  setTickets(tickets.map(ticket => ticket.id === id ? data : ticket));
};

  // ================= DRAG =================
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const ticketId = Number(result.draggableId);
    const newStatus = result.destination.droppableId;

    updateStatus(ticketId, newStatus);
  };

  // ================= ADD COMMENT =================
  const addComment = async (ticketId) => {

    const input = commentInputs[ticketId];
    if (!input?.text || !input?.author) return;

    const res = await fetch("http://localhost:5000/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket_id: ticketId,
        text: input.text,
        author: input.author
      })
    });

    const data = await res.json();

    setComments(prev => ({
      ...prev,
      [ticketId]: [data, ...(prev[ticketId] || [])]
    }));

    setCommentInputs({
      ...commentInputs,
      [ticketId]: { text: "", author: "" }
    });
  };

  // ================= DELETE COMMENT =================
  const deleteComment = async (commentId, ticketId) => {
    await fetch(`http://localhost:5000/comments/${commentId}`, {
      method: "DELETE"
    });

    setComments(prev => ({
      ...prev,
      [ticketId]: prev[ticketId].filter(c => c.id !== commentId)
    }));
  };

  // ================= UI =================
  return (
    <div style={{ padding: "20px" }}>

      <h2>Create Ticket</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /><br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /><br /><br />

        <input
  placeholder="Assign to (email)"
  value={assignedTo}
  onChange={(e) => setAssignedTo(e.target.value)}
/>
<br /><br />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <br /><br />
        <button>Create Ticket</button>
      </form>

      <hr />

      <DragDropContext onDragEnd={onDragEnd}>

        <div style={{ display: "flex", gap: "20px" }}>

          {statuses.map(status => (

            <Droppable droppableId={status} key={status}>
              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "260px",
                    minHeight: "400px",
                    background: "#f2f2f2",
                    padding: "10px",
                    borderRadius: "6px"
                  }}
                >

                  <h3>{status.toUpperCase()}</h3>

                  {tickets
                    .filter(t => t.status === status)
                    .map((t, index) => (

                      <Draggable
                        key={t.id}
                        draggableId={t.id.toString()}
                        index={index}
                      >
                        {(provided) => (

                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: status === "completed" ? "#d4f8d4" : "white",
                              padding: "10px",
                              marginBottom: "10px",
                              borderRadius: "5px",
                              ...provided.draggableProps.style
                            }}
                          >

                          {editId === t.id ? (
  <>
    <input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
    />

    <textarea
      value={editDesc}
      onChange={(e) => setEditDesc(e.target.value)}
    />

    <input
  placeholder="Assign to (email)"
  value={editAssigned}
  onChange={(e)=>setEditAssigned(e.target.value)}
/>

   <button type="button" onClick={() => saveEdit(t.id)}>
  Save
</button>

<button type="button" onClick={() => setEditId(null)}>
  Cancel
</button>
  </>
) : (
  <>
    <b>{t.title}</b>
    <p>{t.description}</p>

    <button type= "button"
     onClick={() => startEdit(t)}>Edit</button>
  </>
)}
            

                            <p>
                              Priority:
                              <span style={{
                                color:
                                  t.priority === "high" ? "red" :
                                  t.priority === "medium" ? "orange" :
                                  "green"
                              }}>
                                {" "}{t.priority}
                              </span>
                            </p>

<p>
  <b>Assigned:</b>{" "}
  {t.assigned_to
    ? t.assigned_to
        .split("@")[0]
        .charAt(0)
        .toUpperCase() +
      t.assigned_to.split("@")[0].slice(1)
    : "Unassigned"}
</p>

                            <button onClick={() => deleteTicket(t.id)}>Delete</button>

                            <hr />

                            <input
                              placeholder="Your name"
                              value={commentInputs[t.id]?.author || ""}
                              onChange={(e) =>
                                setCommentInputs({
                                  ...commentInputs,
                                  [t.id]: {
                                    ...commentInputs[t.id],
                                    author: e.target.value
                                  }
                                })
                              }
                            />

                            <input
                              placeholder="Write comment"
                              value={commentInputs[t.id]?.text || ""}
                              onChange={(e) =>
                                setCommentInputs({
                                  ...commentInputs,
                                  [t.id]: {
                                    ...commentInputs[t.id],
                                    text: e.target.value
                                  }
                                })
                              }
                            />

                            <button type= "button" onClick={() => addComment(t.id)}>
                              Add Comment
                            </button>

                            {comments[t.id] && comments[t.id].map((c, i) => (
                              <p key={i}>
                                👉 {c.text} — <b>{c.author}</b>
                                <br />
                                <small style={{ color: "gray" }}>
                                  {new Date(c.created_at).toLocaleString()}
                                </small>

                                <br />
                                <button onClick={() => deleteComment(c.id, t.id)}>
                                  Delete
                                </button>
                              </p>
                            ))}

                          </div>

                        )}
                      </Draggable>

                    ))}

                  {provided.placeholder}

                </div>

              )}
            </Droppable>

          ))}

        </div>

      </DragDropContext>

    </div>
  );
}