"use client";
import { useAuthContext } from "@/app/provider";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DesignCard from "./_components/DesignCard";
import { RECORD } from "@/app/view-code/[uid]/page";

function Designs() {
  const { user } = useAuthContext();
  const [wireframeList, setWireframeList] = useState([]);
  useEffect(() => {
    user && GetAllUserWireframe();
  }, [user]);

  const GetAllUserWireframe = async () => {
    const result = await axios.get(
      "/api/wireframe-to-code?email=" + user?.email
    );
    console.log(result.data);
    setWireframeList(result.data);
  };

  return (
    <div className="xl:px-20 mt-5">
      <h2 className="font-bold text-2xl">Wireframes & Designs</h2>

      {wireframeList.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-7 mt-10">
          {wireframeList.map((item: RECORD, index) => (
            <DesignCard key={index} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-10 p-6 border rounded-lg bg-gray-50 text-center">
          <p className="text-gray-500 font-medium text-lg">
            No designs available
          </p>
        </div>
      )}
    </div>
  );
}

export default Designs;
