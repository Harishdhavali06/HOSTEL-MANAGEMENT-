import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Bed,
  Plus,
  Users,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const RoomManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

  // Forms state
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('double');
  const [capacity, setCapacity] = useState(2);
  const [rent, setRent] = useState(150);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  const fetchData = async () => {
    try {
      const roomsData = await api.get('/rooms');
      setRooms(roomsData);

      if (isAdmin) {
        const studentsData = await api.get('/students');
        setStudents(studentsData);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve room lists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setRoomNumber('');
    setRoomType('double');
    setCapacity(2);
    setRent(150);
    setIsAddModalOpen(true);
  };

  const handleOpenAllocateModal = (roomId) => {
    setSelectedRoomId(roomId || '');
    setSelectedStudentId('');
    setIsAllocateModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rooms', {
        roomNumber,
        type: roomType,
        capacity: Number(capacity),
        rentPerMonth: Number(rent)
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add room.');
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rooms/allocate', {
        studentId: selectedStudentId,
        roomId: selectedRoomId
      });
      setIsAllocateModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to allocate room.');
    }
  };

  const handleDeallocate = async (studentProfileId) => {
    if (!window.confirm('Are you sure you want to deallocate this student from their room?')) {
      return;
    }
    setError('');
    try {
      await api.post('/rooms/deallocate', { studentId: studentProfileId });
      fetchData();
    } catch (err) {
      setError(err.message || 'Deallocation failed.');
    }
  };

  // Helper to map capacities depending on room type selection
  const handleTypeChange = (typeVal) => {
    setRoomType(typeVal);
    if (typeVal === 'single') {
      setCapacity(1);
      setRent(250);
    } else if (typeVal === 'double') {
      setCapacity(2);
      setRent(150);
    } else if (typeVal === 'triple') {
      setCapacity(3);
      setRent(100);
    } else if (typeVal === 'dormitory') {
      setCapacity(6);
      setRent(60);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Room Management
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">
            Create rooms, assign hostellers, and monitor capacities.
          </p>
        </div>
        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Add Room</span>
            </button>
            <button
              onClick={() => handleOpenAllocateModal('')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md transition-transform active:scale-[0.98]"
            >
              <ClipboardList size={16} />
              <span>Assign Room</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
          Fetching room layouts...
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          No room files registered. Click Add Room to create.
        </div>
      ) : (
        /* Rooms Layout Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => {
            const occupiedCount = room.occupants?.length || 0;
            const percentage = Math.round((occupiedCount / room.capacity) * 100);

            // Status color helper
            let statusColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            if (room.status === 'full') statusColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            if (room.status === 'maintenance') statusColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20';

            return (
              <div key={room._id || room.id} className="glass-card p-6 rounded-2xl border shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                        <Bed size={20} className="text-cyan-500" />
                        <span>Room {room.roomNumber}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">
                        Type: {room.type} • Rent: ${room.rentPerMonth}/mo
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${statusColor}`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Occupancy Progress bar */}
                  <div className="mt-5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-semibold">
                      <span>Occupancy: {occupiedCount} / {room.capacity} slots</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage === 100 
                            ? 'bg-rose-500' 
                            : percentage > 50 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Occupants list */}
                  <div className="mt-5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Occupants
                    </span>
                    {occupiedCount === 0 ? (
                      <span className="text-xs text-slate-400 italic block py-1">Vacant room slot</span>
                    ) : (
                      <div className="space-y-1.5">
                        {room.occupants.map(occ => {
                          // Find student profile ID to allow deallocation
                          const studentProfile = students.find(s => s.user?._id === occ._id || s.user === occ._id || s.user?.id === occ.id);
                          return (
                            <div key={occ._id || occ.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="h-5 w-5 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-[10px]">
                                  {occ.name?.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-750 dark:text-slate-350">{occ.name}</span>
                              </div>
                              {isAdmin && studentProfile && (
                                <button
                                  onClick={() => handleDeallocate(studentProfile._id || studentProfile.id)}
                                  className="text-[10px] font-semibold text-red-500 hover:underline"
                                >
                                  Deallocate
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {isAdmin && room.status === 'available' && (
                  <button
                    onClick={() => handleOpenAllocateModal(room._id || room.id)}
                    className="w-full mt-6 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition"
                  >
                    Allocate Slots
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Room">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Room Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 101, B-205"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
            >
              <option value="single">Single Bed</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
              <option value="dormitory">Dormitory</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Max Capacity</label>
              <input
                type="number"
                required
                readOnly
                value={capacity}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Rent per Month ($)</label>
              <input
                type="number"
                required
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
          >
            Create Room
          </button>
        </form>
      </Modal>

      {/* Allocate Room Modal */}
      <Modal isOpen={isAllocateModalOpen} onClose={() => setIsAllocateModalOpen(false)} title="Allocate Room to Student">
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Student</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
            >
              <option value="">-- Choose Student --</option>
              {students
                .filter(s => !s.room && s.status === 'active')
                .map(s => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.user?.name} ({s.studentId})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Room</label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none text-slate-350"
            >
              <option value="">-- Choose Room --</option>
              {rooms
                .filter(r => r.status === 'available')
                .map(r => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    Room {r.roomNumber} ({r.type} - {r.occupants?.length || 0}/{r.capacity} filled)
                  </option>
                ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl text-xs hover:shadow-lg transition active:scale-[0.98]"
          >
            Confirm Allocation
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
