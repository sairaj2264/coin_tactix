import React, { useState } from "react";

const VersionDisplay = () => {
  const [version, setVersion] = useState("");

  const fetchVersion = async () => {
    try {
      const response = await fetch("/api/system/version");
      const data = await response.json();
      setVersion(data.version);
    } catch (error) {
      console.error("Error fetching version:", error);
      setVersion("Error fetching version");
    }
  };

  return (
    <div>
      <button onClick={fetchVersion}>Get Version</button>
      {version && <p>Version: {version}</p>}
    </div>
  );
};
//Just an addition to test the connection
//Just antophter linbe of comment

export default VersionDisplay;
