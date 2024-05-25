import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

const ActivityLog = () => {
  const [activityData, setActivityData] = useState([]);
  const [turnOnCount, setTurnOnCount] = useState(0);
  const [turnOffCount, setTurnOffCount] = useState(0);
  const [hours, setHours] = useState(0);

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

        let totalHoursTurnedOn = 0;
        const reversed = data.activitylogs.reverse();
        reversed.forEach((activity, index) => {
          if (activity.message.includes('turned on')) {
            const nextTurnedOffIndex = reversed.findIndex((a, i) => i > index && a.message.includes('turned off'));
            if (nextTurnedOffIndex !== -1) {
              const turnedOnTime = new Date(activity.createdAt);
              const turnedOffTime = new Date(reversed[nextTurnedOffIndex].createdAt);
              const durationMilliseconds = turnedOffTime - turnedOnTime;
              const durationHours = durationMilliseconds / (1000 * 60 * 60);
              totalHoursTurnedOn += durationHours;
            }
          }
        });
        setHours(totalHoursTurnedOn.toFixed(2));
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

  const data = {
    labels: ['Turned On Time', 'Remaining Time'],
    datasets: [
      {
        data: [hours, 24 - hours],
        backgroundColor: ['#4CAF50', '#FF6347'],
        hoverBackgroundColor: ['#66BB6A', '#FF7F50'],
      },
    ],
  };

  return (
    <div>
      <div>
        <p>Turned On Count: {turnOnCount}</p>
        <p>Turned Off Count: {turnOffCount}</p>
        <p>Total no of hours : {hours} hrs</p>
      </div>
      <h2>Activity Log</h2>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Message</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {activityData.map((activity, index) => (
            <tr key={activity.id}>
              <td>{index + 1}</td>
              <td>{activity.message}</td>
              <td>{new Date(activity.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    
    </div>
  );
};

export default ActivityLog;
