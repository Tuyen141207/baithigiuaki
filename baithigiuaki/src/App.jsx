import { useState, useEffect } from 'react';
import './App.css';

const CITIES = [
  { id: 1, name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { id: 2, name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { id: 3, name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { id: 4, name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { id: 5, name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { id: 6, name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { id: 7, name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { id: 8, name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 }
];

const getWeatherInfo = (code) => {
  if (code === 0) return { icon: '☀️', text: 'Trời quang' };
  if ([1, 2, 3].includes(code)) return { icon: '⛅', text: 'Nhiều mây' };
  if ([45, 48].includes(code)) return { icon: '🌫️', text: 'Sương mù' };
  if (code >= 51 && code <= 67) return { icon: '🌧️', text: 'Mưa' };
  if (code >= 71 && code <= 77) return { icon: '❄️', text: 'Tuyết' };
  if (code >= 95) return { icon: '⛈️', text: 'Dông bão' };
  return { icon: '🌈', text: 'Không xác định' };
};

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle');
  const [unit, setUnit] = useState('C');

  useEffect(() => {
    if (!selectedCity) return;
    const fetchWeather = async () => {
      setStatus('loading');
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`);
        if (!res.ok) throw new Error('Lỗi tải dữ liệu');
        setWeather(await res.json());
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    fetchWeather();
  }, [selectedCity]);

  const formatTemp = (temp) => unit === 'C' ? Math.round(temp) : Math.round(temp * 9 / 5 + 32);

  const renderContent = () => {
    if (status === 'idle') return <div className="msg">Vui lòng chọn một thành phố.</div>;
    if (status === 'loading') return <div className="msg">Đang tải dữ liệu thời tiết...</div>;
    if (status === 'error') return (
      <div className="msg">
        Có lỗi xảy ra. <button onClick={() => setSelectedCity({ ...selectedCity })}>Thử lại</button>
      </div>
    );

    if (status === 'success' && weather) {
      const curr = weather.current;
      const info = getWeatherInfo(curr.weather_code);
      return (
        <div className="weather-content">
          <div className="current-weather">
            <h2>{selectedCity.name}</h2>
            <div className="large-icon">{info.icon}</div>
            <h3>{info.text}</h3>
            <h1 className="temp">{formatTemp(curr.temperature_2m)}°{unit}</h1>
            <div className="details">
              <span>💧 Độ ẩm: {curr.relative_humidity_2m}%</span>
              <span>💨 Gió: {curr.wind_speed_10m} km/h</span>
            </div>
            <p className="update-time">Cập nhật lúc: {new Date(curr.time).toLocaleString('vi-VN')}</p>
          </div>

          <div className="daily-forecast">
            {weather.daily.time.map((dateStr, i) => {
              const dayDate = new Date(dateStr);
              const dayName = i === 0 ? 'Hôm nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dayDate.getDay()];
              const dInfo = getWeatherInfo(weather.daily.weather_code[i]);
              return (
                <div key={dateStr} className="day-card">
                  <h4>{dayName}</h4>
                  <small>{dayDate.getDate()}/{dayDate.getMonth() + 1}</small>
                  <div className="day-icon">{dInfo.icon}</div>
                  <div className="day-temps">
                    <span className="max">{formatTemp(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="min">{formatTemp(weather.daily.temperature_2m_min[i])}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h3>Danh sách thành phố</h3>
        <ul>
          {CITIES.map(city => (
            <li 
              key={city.id} 
              className={selectedCity?.id === city.id ? 'active' : ''}
              onClick={() => setSelectedCity(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <div className="header">
          <button className="unit-btn" onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}>
            Đổi sang °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;