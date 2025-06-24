import React, { useState } from "react";

export default function CreateProjectPage() {
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Đề tài mới:", { title, objective, description });
    alert("Đề tài đã được gửi!");
    // TODO: Gửi dữ liệu lên server ở đây
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Tạo đề tài mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Tên đề tài:</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Mục tiêu:</label>
          <br />
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            required
            rows={3}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Mô tả chi tiết:</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button type="submit" style={{ padding: "8px 16px" }}>
          Gửi đề tài
        </button>
      </form>
    </div>
  );
}
