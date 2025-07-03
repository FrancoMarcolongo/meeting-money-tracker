import React, { useState, useRef } from 'react';
import './App.css';

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

const HOURS_PER_MONTH = 40 * 4; // 160
const TIMER_INTERVAL = 100; // ms
const INTRO_MINUTES = 3;

// Empleados predefinidos de ejemplo
const EMPLOYEES_PREDEF = [
  { name: 'Luis1', rate: 5000, rateType: 'month', originalRate: 5000 },
  { name: 'Luis2', rate: 5000, rateType: 'month', originalRate: 5000 },
  { name: 'Luis3', rate: 5000, rateType: 'month', originalRate: 5000 },
  { name: 'Luis4', rate: 5000, rateType: 'month', originalRate: 5000 },
  { name: 'Luis5', rate: 5000, rateType: 'month', originalRate: 5000 },
  { name: 'Luis6', rate: 5000, rateType: 'month', originalRate: 5000 },
];

function toHourly(emp) {
  if (emp.rateType === 'month') {
    return { ...emp, rate: emp.originalRate / HOURS_PER_MONTH };
  }
  return emp;
}

function App() {
  // Configuración y empleados
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [rateHour, setRateHour] = useState('');
  const [rateMonth, setRateMonth] = useState('');
  const [startTime, setStartTime] = useState(''); // 'HH:MM'
  const [meetingDuration, setMeetingDuration] = useState(30); // minutos
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0); // ms desde inicio meeting
  const [currentSpeakerIdx, setCurrentSpeakerIdx] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Estado extendido por empleado
  const [employeeStates, setEmployeeStates] = useState([]); // [{tiempoHablado, dineroPerdido, offTrack, excedido}]

  // Inicializar estados cuando cambian empleados o duración
  React.useEffect(() => {
    if (employees.length === 0) {
      setEmployeeStates([]);
      setCurrentSpeakerIdx(0);
      return;
    }
    const tiempoPorEmpleado = Math.max(0, ((Number(meetingDuration) - INTRO_MINUTES) * 60) / employees.length);
    setEmployeeStates(
      employees.map(() => ({
        tiempoAsignado: tiempoPorEmpleado,
        tiempoHablado: 0,
        dineroPerdido: 0,
        offTrack: false,
        excedido: false,
      }))
    );
    setCurrentSpeakerIdx(0);
  }, [employees, meetingDuration]);

  // Cargar empleados predefinidos
  const handleLoadPredef = () => {
    setEmployees(EMPLOYEES_PREDEF.map(toHourly));
  };

  // Borrar todos los empleados y resetear configuración
  const handleClearAll = () => {
    setEmployees([]);
    setStartTime('');
    setMeetingDuration(60);
    setElapsedMs(0);
    setRunning(false);
    setEmployeeStates([]);
    setCurrentSpeakerIdx(0);
    clearInterval(intervalRef.current);
  };

  // Start or pause timer
  const handleStartPause = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      // Calcular offset si ya había tiempo transcurrido
      startTimeRef.current = Date.now() - elapsedMs;
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, TIMER_INTERVAL);
      setRunning(true);
    }
  };

  // Reset timer
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setElapsedMs(0);
    setRunning(false);
    // Reset tiempos hablados y dinero perdido
    setEmployeeStates(states => states.map(s => ({...s, tiempoHablado: 0, dineroPerdido: 0, excedido: false, offTrack: false})));
    setCurrentSpeakerIdx(0);
  };

  // Add employee
  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    let hourlyRate = null;
    let originalRate = null;
    let rateType = null;
    if (rateHour && !isNaN(rateHour) && Number(rateHour) > 0) {
      hourlyRate = Number(rateHour);
      originalRate = Number(rateHour);
      rateType = 'hour';
    } else if (rateMonth && !isNaN(rateMonth) && Number(rateMonth) > 0) {
      hourlyRate = Number(rateMonth) / HOURS_PER_MONTH;
      originalRate = Number(rateMonth);
      rateType = 'month';
    } else {
      return;
    }
    setEmployees([...employees, { name: name.trim(), rate: hourlyRate, originalRate, rateType }]);
    setName('');
    setRateHour('');
    setRateMonth('');
  };

  // Next speaker
  const handleNext = () => {
    setCurrentSpeakerIdx(idx => (idx + 1) % employees.length);
  };

  // Toggle off-track para el actual
  const handleToggleOffTrack = () => {
    setEmployeeStates(states => states.map((s, idx) => idx === currentSpeakerIdx ? {...s, offTrack: !s.offTrack} : s));
  };

  // Timer: sumar tiempo y dinero perdido por empleado
  React.useEffect(() => {
    if (!running || employees.length === 0) return;
    let lastTick = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTick) / 1000; // segundos
      lastTick = now;
      setEmployeeStates(states => {
        const current = states[currentSpeakerIdx];
        let tiempoHablado = current.tiempoHablado + delta;
        let excedido = tiempoHablado > current.tiempoAsignado;
        let sumarDinero = current.offTrack || excedido;
        let newStates = states.map((s, idx) =>
          idx === currentSpeakerIdx
            ? { ...s, tiempoHablado, excedido }
            : s
        );
        if (sumarDinero) {
          // Sumar al total (por todos), pero solo al orador individualmente
          const totalPerSecond = employees.reduce((sum, emp) => sum + emp.rate / 3600, 0);
          const add = totalPerSecond * delta;
          newStates = newStates.map((s, idx) =>
            idx === currentSpeakerIdx
              ? { ...s, dineroPerdido: (s.dineroPerdido || 0) + add }
              : s
          );
          // Sumar al acumulador global (fuera del estado de empleados)
          // (ya se refleja en el totalLost, que es suma de todos los individuales)
        }
        return newStates;
      });
    };
    const id = setInterval(tick, TIMER_INTERVAL);
    return () => clearInterval(id);
  }, [running, employees, currentSpeakerIdx]);

  // Dinero perdido total
  const totalLost = employeeStates.reduce((sum, s) => sum + (s.dineroPerdido || 0), 0);
  const elapsed = Math.floor(elapsedMs / 1000);

  // Speaker actual
  const currentSpeaker = employees[currentSpeakerIdx];
  const currentState = employeeStates[currentSpeakerIdx] || {};

  // Formato de tiempo
  function formatTime(sec) {
    return `${Math.floor(sec/60).toString().padStart(2,'0')}:${Math.floor(sec%60).toString().padStart(2,'0')}`;
  }

  return (
    <div className="container">
      <h1>Meeting Money Tracker</h1>
      <div className="summary" style={{marginTop: 0, marginBottom: '2rem'}}>
        <div>Total per hour: <b>{formatMoney(employees.reduce((sum, emp) => sum + emp.rate, 0))}</b></div>
        <div>Time: <b>{formatTime(elapsed)}</b></div>
        <div>Money lost: <b style={{fontSize:'2em'}}>{formatMoney(totalLost)}</b></div>
      </div>
      <div style={{marginBottom:16, padding:12, border:'1px solid #eee', borderRadius:8, background:'#fafbfc'}}>
        <div style={{fontWeight:'bold', fontSize:'1.1em', marginBottom:4}}>Current speaker:</div>
        {currentSpeaker ? (
          <>
            <div style={{fontSize:'1.2em'}}>{currentSpeaker.name}</div>
            <div>Assigned: {formatTime(currentState.tiempoAsignado || 0)} | Spoken: {formatTime(currentState.tiempoHablado || 0)}</div>
            <div>Lost: <b>{formatMoney(currentState.dineroPerdido || 0)}</b></div>
            <div style={{margin:'8px 0'}}>
              <button onClick={handleNext} disabled={!running} style={{marginRight:8}}>Next</button>
              <button onClick={handleToggleOffTrack} disabled={!running} style={{background:currentState.offTrack?'#e67e22':'#eee', color:currentState.offTrack?'#fff':'#333'}}>
                {currentState.offTrack ? 'Off-track ON' : 'Off-track OFF'}
              </button>
            </div>
            {currentState.excedido && <div style={{color:'#e74c3c', fontWeight:'bold'}}>EXCEEDED TIME!</div>}
          </>
        ) : <div style={{color:'#888'}}>No speaker</div>}
      </div>
      <div style={{display:'flex', gap:16, marginBottom:12}}>
        <label style={{fontSize:'1em'}}>Start time:&nbsp;
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            step="60"
            placeholder="HH:MM"
            style={{width:'110px'}}
          />
        </label>
        <label style={{fontSize:'1em'}}>Duration (min):&nbsp;
          <input
            type="number"
            value={meetingDuration}
            onChange={e => setMeetingDuration(e.target.value)}
            min={INTRO_MINUTES+1}
            style={{width:'70px'}}
          />
        </label>
      </div>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button onClick={handleLoadPredef} disabled={running}>
          Load example employees
        </button>
        <button onClick={handleClearAll} disabled={running || employees.length === 0} style={{background:'#e74c3c', color:'#fff'}}>
          Clear all
        </button>
        <button onClick={handleStartPause} disabled={employees.length === 0}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={handleReset} disabled={elapsed === 0 && !running}>
          Reset
        </button>
      </div>
      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Employee name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={running}
        />
        <input
          type="number"
          placeholder="Hourly rate (USD)"
          value={rateHour}
          onChange={e => setRateHour(e.target.value)}
          min="0"
          step="0.01"
          disabled={running}
        />
        <input
          type="number"
          placeholder="Monthly rate (USD)"
          value={rateMonth}
          onChange={e => setRateMonth(e.target.value)}
          min="0"
          step="0.01"
          disabled={running}
        />
        <button type="submit" disabled={running}>Add</button>
      </form>
      <ul className="employee-list">
        {employees.map((emp, idx) => (
          <li
            key={idx}
            style={{
              background: idx === currentSpeakerIdx ? '#2563eb' : undefined,
              color: idx === currentSpeakerIdx ? '#fff' : undefined,
              borderRadius: 4,
              marginBottom: 2,
              padding: '2px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <span>
              {emp.name} — {formatMoney(emp.rate)}/h
              {emp.rateType === 'month' && (
                <span style={{ color: idx === currentSpeakerIdx ? '#e0e0e0' : '#888', fontSize: '0.95em' }}> ({formatMoney(emp.originalRate)}/month)</span>
              )}
              <span style={{ marginLeft: 8, color: idx === currentSpeakerIdx ? '#e0e0e0' : '#888', fontSize: '0.95em' }}>
                Lost: {formatMoney(employeeStates[idx]?.dineroPerdido || 0)}
              </span>
              {employeeStates[idx]?.excedido && <span style={{ color: '#e74c3c', marginLeft: 8, fontWeight: 'bold' }}>EXCEEDED</span>}
              {employeeStates[idx]?.offTrack && <span style={{ color: '#e67e22', marginLeft: 8, fontWeight: 'bold' }}>OFF-TRACK</span>}
            </span>
            <span style={{ fontSize: '0.93em', color: idx === currentSpeakerIdx ? '#e0e0e0' : '#888', marginLeft: 2 }}>
              Reserved: {formatTime(employeeStates[idx]?.tiempoAsignado || 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
