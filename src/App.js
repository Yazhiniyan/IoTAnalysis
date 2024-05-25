import React, { useState, useEffect } from 'react';

const ActivityLog = () => {
  const [activityData, setActivityData] = useState([]);
  const [turnOnCount, setTurnOnCount] = useState(0);
  const [turnOffCount, setTurnOffCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.sinric.pro/api/v1/activitylog', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTE4ODIyNjc0ZTIwOGU2ZmRlODJkOSIsInRpZCI6IjY2NTFhNjExNjc0ZTIwOGU2ZmRlOGZlYSIsImlhdCI6MTcxNjYyNjk2MSwiZXhwIjoxNzE3MjMxNzYxfQ.GWFsThZtqvckdPbke1YArxgRS9fuKL5YJBEj8a79cNc',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        const data = await response.json();
        setActivityData(data.activitylogs);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let onCount = 0;
    let offCount = 0;
    activityData.forEach(activity => {
      if (activity.message.includes('turned on')) {
        onCount++;
      } else if (activity.message.includes('turned off')) {
        offCount++;
      }
    });
    setTurnOnCount(onCount);
    setTurnOffCount(offCount);
  }, [activityData]);

  return (
    <div>
      <h2>Activity Log</h2>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Location</th>
            <th>Client ID</th>
            <th>Message</th>
            <th>Device</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {activityData.map(activity => (
            <tr key={activity.id}>
              <td>{activity.ipAddress}</td>
              <td>{activity.location}</td>
              <td>{activity.clientId}</td>
              <td>{activity.message}</td>
              <td>{activity.device}</td>
              <td>{activity.createdAt}</td>
              <td>{activity.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <p>Turned On Count: {turnOnCount}</p>
        <p>Turned Off Count: {turnOffCount}</p>
      </div>
    </div>
  );
};

export default ActivityLog;
