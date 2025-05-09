import React from "react";
import ImageUpload from "./_components/ImageUpload";

function Dashboard() {
  return (
    <div className="xl:px-20 mt-5">
      <h2 className="font-bold text-3xl">Convert Wireframe to Web</h2>
      <ImageUpload />
    </div>
  );
}

export default Dashboard;
