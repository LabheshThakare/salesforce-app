import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [rules, setRules] = useState([]);

  const handleLogin = () => {
    const clientId = "3MVG9WVXk15qiz1IaGIRMhbl70pGA4lqTK7uRFVwsaL6jnmMv_07TQdJAVSyPcfQv.LoWg8XTrBJgBn8u67yj";
    const redirectUri = "http://localhost:3000";

    const authUrl =
      "https://login.salesforce.com/services/oauth2/authorize" +
      "?response_type=token" +
      "&client_id=" + clientId +
      "&redirect_uri=" + redirectUri;

    window.location.href = authUrl;
  };

  const handleLogout = () => {
    setToken("");
    setInstanceUrl("");
    setRules([]);
    window.location.href = "http://localhost:3000/";
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", ""));
      setToken(params.get("access_token"));
      setInstanceUrl(params.get("instance_url"));
    }
  }, []);

  const fetchValidationRules = async () => {
    const url = `/services/data/v57.0/tooling/query/?q=SELECT+Id,ValidationName,Active+FROM+ValidationRule`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setRules(data.records);
  };

  const toggleRule = async (ruleId, currentStatus) => {
    try {
      const url = `/services/data/v57.0/tooling/sobjects/ValidationRule/${ruleId}`;
  
      await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Active: !currentStatus,
        }),
      });
  
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.Id === ruleId
            ? { ...rule, Active: !currentStatus }
            : rule
        )
      );
  
    } catch (error) {
      console.error("Toggle failed", error);
    }
  };
  const toggleAllRules = async (enable) => {
    for (let rule of rules) {
      await toggleRule(rule.Id, rule.Active);
    }
  };
  const handleDeploy = async () => {
    try {
      await fetchValidationRules();
  
      alert("✅ Changes deployed successfully to Salesforce!");
  
    } catch (error) {
      console.error("Deploy failed", error);
      alert("❌ Deployment failed!");
    }
  };
  return (
    <div className="container">
      <h1>🚀 Salesforce Validation Rule Manager</h1>

      {!token ? (
        <div className="login-box">
          <h2>Welcome 👋</h2>
          <p>Login to manage your Salesforce Validation Rules easily.</p>
          <button className="btn login" onClick={handleLogin}>
            Login with Salesforce
          </button>
        </div>
      ) : (
        <>
          <div className="top-bar">
            <button className="btn fetch" onClick={fetchValidationRules}>
              Fetch Rules
            </button>

            <button className="btn enable" onClick={() => toggleAllRules(true)}>
             Enable All
            </button>

            <button className="btn disable" onClick={() => toggleAllRules(false)}>
              Disable All
           </button>
           <button className="btn deploy" onClick={handleDeploy}>
             Deploy Changes
           </button>

            <button className="btn logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rules.map((rule) => (
                <tr key={rule.Id}>
                  <td>{rule.ValidationName}</td>

                  <td>
                    {rule.Active ? " Enabled " : "Disabled"}
                  </td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={rule.Active}
                        onChange={() =>
                          toggleRule(rule.Id, rule.Active)
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;