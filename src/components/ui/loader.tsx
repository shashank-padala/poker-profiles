import React from "react";

export const Loader = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
    </div>
  );
};
