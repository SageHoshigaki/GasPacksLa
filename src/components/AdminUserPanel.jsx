import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from '../lib/supabaseClient'; // update path if needed

const AdminUserPanel = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_verification_status")
      .select("id, user_id, status, updated_at")
      .order("updated_at", { ascending: false });

    if (error) console.error("Error loading users:", error);
    else setUsers(data);

    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("user_verification_status")
      .update({ status })
      .eq("id", id);

    if (error) alert("Update failed");
    else fetchUsers();
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress === "admin@gaspacksla.com") {
      fetchUsers();
    }
  }, [user]);

  if (!user || user.primaryEmailAddress.emailAddress !== "admin@gaspacksla.com") {
    return <div className="notification is-danger mt-6 has-text-centered">Access Denied</div>;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title is-3 has-text-centered">Admin User Panel</h1>

        {loading ? (
          <progress className="progress is-small is-info" max="100">Loading</progress>
        ) : (
          <div className="table-container">
            <table className="table is-bordered is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.user_id}</td>
                    <td><span className={`tag is-${
                      user.status === "approved"
                        ? "success"
                        : user.status === "pending"
                        ? "warning"
                        : "danger"
                    }`}>{user.status}</span></td>
                    <td>{new Date(user.updated_at).toLocaleString()}</td>
                    <td>
                      <div className="buttons are-small">
                        <button
                          className="button is-success"
                          onClick={() => updateStatus(user.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="button is-warning"
                          onClick={() => updateStatus(user.id, "pending")}
                        >
                          Pending
                        </button>
                        <button
                          className="button is-danger"
                          onClick={() => updateStatus(user.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminUserPanel;