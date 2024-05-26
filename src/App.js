import React, { useState, useEffect } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
// import Header from "./Header";
import LineChart from 'react-linechart';
import 'react-linechart/dist/styles.css';
import './App.css';

const ActivityLog = () => {
  const [activityData, setActivityData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [show, setShow] = useState(false);

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

        const dailyDataMap = {};
        const reveresed = data.activitylogs.reverse();
        reveresed.forEach((activity, index) => {
          const date = new Date(activity.createdAt).toISOString().split('T')[0];
          if (!dailyDataMap[date]) {
            dailyDataMap[date] = { bulb1: { onHours: 0, offHours: 24, onCount: 0, offCount: 0 }, bulb2: { onHours: 0, offHours: 24, onCount: 0, offCount: 0 } };
          }
          const bulbKey = activity.message.includes('Bulb 1') ? 'bulb1' : 'bulb2';
          if (activity.message.includes('turned on')) {
            console.log("index : " + (index + 1));
            dailyDataMap[date][bulbKey].onCount++;
            const nextTurnedOffIndex = reveresed.findIndex((a, i) => i > index && a.message.includes('turned off') && a.message.includes(bulbKey === 'bulb1' ? 'Bulb 1' : 'Bulb 2'));
            console.log("next index: " + (nextTurnedOffIndex + 1))
            if (nextTurnedOffIndex !== -1) {
              const turnedOnTime = new Date(activity.createdAt);
              const turnedOffTime = new Date(reveresed[nextTurnedOffIndex].createdAt);
              const durationMilliseconds = turnedOffTime - turnedOnTime;
              const durationHours = durationMilliseconds / (1000 * 60 * 60);
              dailyDataMap[date][bulbKey].onHours += durationHours;
              dailyDataMap[date][bulbKey].offHours -= durationHours;
            }
          } else if (activity.message.includes('turned off')) {
            dailyDataMap[date][bulbKey].offCount++;
          }
        });

        setDailyData(Object.entries(dailyDataMap));
        setShow(true);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    fetchData();
  }, []);



  const totalOnHours = dailyData.reduce((total, [, data]) => total + data.bulb1.onHours + data.bulb2.onHours, 0);
  const totalOffHours = dailyData.reduce((total, [, data]) => total + data.bulb1.offHours + data.bulb2.offHours, 0);
  const totalOnCount = dailyData.reduce((total, [, data]) => total + data.bulb1.onCount + data.bulb2.onCount, 0);
  const totalOffCount = dailyData.reduce((total, [, data]) => total + data.bulb1.offCount + data.bulb2.offCount, 0);
  
  const lineChartData = [
    {
      color: "steelblue",
      points: dailyData.map(([{date}, {onHours}], index) => ({
        x: index + 1,
        y: onHours
      }))
    }
  ];
  return (
    <div className="activity-log-container">
   <h1><center>ROOM LIGHTS ON/OFF HOURS ANALYSIS</center></h1>
      <br></br> <br></br>
      <h2 style={{textAlign:"left"}}>LIST OF EVERY DAY ANALYSIS:</h2>
      <div className="charts-container" style={{overflowY:"scroll"}}>
        {dailyData.map(([date, { bulb1, bulb2 }], index) => (
          <div key={index} className="chart-item" >
            <h2 style={{textAlign:"left"}}><strong>Date:</strong> {date}</h2>
            <br></br>
            {show && (
              <div className="chart-content">
                <h3>Bulb 1</h3>
                <PieChart
                  label={({ dataEntry }) => {return dataEntry.title + " ( "+  (dataEntry.value * 100 / 24 ).toFixed(1) + " % )"}}
                  radius={46}
                  paddingAngle={1}
                  data={[
                    { title: 'ON Time', value: bulb1.onHours, color: '#FF6347' },
                    { title: 'OFF Time', value: bulb1.offHours, color: '#CAEF50' },
                  ]}
                  labelStyle={{
                    fontSize: "4px", fontWeight:"bolder"
                  }}
                />
                <div className="chart-info">
                  <p><strong>Turned On Count:</strong> {bulb1.onCount}</p>
                  <p><strong>Turned Off Count:</strong> {bulb1.offCount}</p>
                  <br></br>
                  <p><strong>HOURS LIGHTS ON IN A DAY:</strong> {bulb1.onHours.toFixed(2)} hrs</p>
                  <p><strong>HOURS LIGHTS OFF IN A DAY:</strong> {bulb1.offHours.toFixed(2)} hrs</p>
                </div>
                <h3>Bulb 2</h3>
                <PieChart
                  label={({ dataEntry }) => {return dataEntry.title + " ( "+  (dataEntry.value * 100 / 24 ).toFixed(1) + " % )"}}
                  radius={46}
                  paddingAngle={1}
                  data={[
                    { title: 'ON Time', value: bulb2.onHours, color: '#FF6347' },
                    { title: 'OFF Time', value: bulb2.offHours, color: '#CAEF50' },
                  ]}
                  labelStyle={{
                    fontSize: "4px",fontWeight:"bolder"
                  }}
                />
                <div className="chart-info">
                  <p><strong>On Count:</strong> {bulb2.onCount}</p>
                  <p><strong>Off Count:</strong> {bulb2.offCount}</p>
                  <br></br>
                  <p><strong>HOURS LIGHTS ON IN A DAY:</strong> {bulb2.onHours.toFixed(2)} hrs</p>
                  <p><strong>HOURS LIGHTS OFF IN A DAY:</strong> {bulb2.offHours.toFixed(2)} hrs</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="overview-widget">
          <h2>Overall Summary</h2>
          <div className="overview-info">
            <p><strong>Total ON Hours:</strong> {totalOnHours.toFixed(2)} hrs</p>
            <p><strong>Total OFF Hours:</strong> {totalOffHours.toFixed(2)} hrs</p>
            <p><strong>Total ON Count:</strong> {totalOnCount}</p>
            <p><strong>Total OFF Count:</strong> {totalOffCount}</p>
          </div>
        </div>
      </div>
      <div className="line-chart-container">
        <h2>Light On Hours Over Days</h2>
        <LineChart 
          width={1200}
          height={400}
          data={lineChartData}
        />
      </div>
      <br></br>
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


