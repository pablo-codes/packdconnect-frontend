import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

export const ProfileSettings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-on-surface">
          Profile Details
        </h2>
        <p className="text-[12px] text-on-surface-variant/80 mt-1 font-medium">
          Review your registered user identity.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-4">
        <div className="input-group">
          <label className="input-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field-pill"
            disabled
          />
        </div>

        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field-pill"
            disabled
          />
        </div>
      </div>
    </div>
  );
};
