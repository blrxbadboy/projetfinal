import React, { useEffect, useState } from 'react';
import ViewJob from './ViewJob';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // New: View Modal States
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const token = localStorage.getItem('token');
  const currentUserEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');

  // tloadyy Jobs ly deja mwjoudyn
  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs');
     
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage("Impossible de charger les missions. Vérifiez que le serveur est démarré.");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  //convert image bch tbeen(required khtr taswyra ma habetch tbeenly)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      setImage(base64);
    }
  };

  //Open View Modal
  const openViewModal = (job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  };

  //Submit Post or Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
   
    if (!token) {
      setErrorMessage("Vous devez être connecté !");
      return;
    }
    console.log("🔑 Token being sent:", token ? token.substring(0, 30) + "..." : "NO TOKEN");
    const url = editingJobId ? `http://localhost:5000/api/jobs/${editingJobId}`: 'http://localhost:5000/api/jobs';
   
    const method = editingJobId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          image: image || "",
          budget,
          location
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(editingJobId ? "Mission modifiée avec succès !" : "✅ Mission publiée avec succès !");
       
        setTitle('');
        setDescription('');
        setImage('');
        setBudget('');
        setLocation('');
        setEditingJobId(null);
        setIsPostModalOpen(false);
       
        fetchJobs();
      } else {
        setErrorMessage(data.message || "Erreur lors de l'opération");
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setErrorMessage("Erreur réseau - Vérifiez que le serveur est lancé");
    }
  };

  //Delete Job
  const deleteJob = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette mission ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Mission supprimée !");
        fetchJobs();
        setIsViewModalOpen(false);
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      setErrorMessage("Erreur lors de la suppression");
    }
  };

  //Open Edit Modal
  const openEdit = (job) => {
    setEditingJobId(job._id);
    setTitle(job.title);
    setDescription(job.description || '');
    setImage(job.image || '');
    setBudget(job.budget ? job.budget.replace(" TND", "") : '');
    setLocation(job.location || '');
    setIsPostModalOpen(true);
    setIsViewModalOpen(false);
  };

  //Filter jobs
  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h2>Welcome , {userName || 'Utilisateur'} !</h2>
      {errorMessage && (
        <div style={{ color: 'red', padding: '15px', background: '#fee2e2', borderRadius: '8px', margin: '15px 0' }}>
          {errorMessage}
        </div>
      )}
    <div className="search-container">
  <span className="search-icon">🔍</span>
  <input
    type="text"
    placeholder="Rechercher une mission..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />
</div>
      <h3>Missions Disponibles ({filteredJobs.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {filteredJobs.map(job => (
          <div 
            key={job._id} 
            className="job-card" 
            onClick={() => openViewModal(job)}
            style={{ cursor: 'pointer' }}
          >
            {job.image && (
              <img
                src={job.image}
                alt="job"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}
              />
            )}
           
            <h4>{job.title}</h4>
            <p>{job.description}</p>
            <p>🏢 {job.client} | 📍 {job.location}</p>
            <p style={{ color: '#2563eb', fontWeight: 'bold' }}>💰 {job.budget}</p>
            {job.createdBy === currentUserEmail && (
              <div style={{ marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => openEdit(job)}
                  className="btn btn-warning"
                  style={{ marginRight: '10px' }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteJob(job._id)}
                  className="btn btn-danger"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
            Aucune mission trouvée.
          </p>
        )}
      </div>
      {/* Floating Button */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="floating-btn"
      >
        +
      </button>

      {/* View Job Modal */}
      {isViewModalOpen && selectedJob && (
        <ViewJob
  job={selectedJob}
  onClose={() => setIsViewModalOpen(false)}
  onEdit={openEdit}
  onDelete={deleteJob}
  isOwner={selectedJob.createdBy === currentUserEmail}
/>
      )}

      {/* Post w Edit Modal */}
      {isPostModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => {
                setIsPostModalOpen(false);
                setEditingJobId(null);
                setTitle(''); setDescription(''); setImage(''); setBudget(''); setLocation('');
              }}
              style={{ float: 'right', fontSize: '30px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              &times;
            </button>
           
            <h3>{editingJobId ? "Modifier la mission" : "Publier une nouvelle mission"}</h3>
            <form onSubmit={handleFormSubmit}>
              <label className="label">Titre de la mission *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                required
              />
              <label className="label">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows="4"
                required
              />
              <label className="label">Photo de la mission</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {image && <img src={image} alt="preview" style={{ width: '100%', borderRadius: '8px', margin: '10px 0' }} />}
              <label className="label">Budget (TND) *</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input-field"
                required
              />
              <label className="label">Localisation *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px', padding: '14px' }}
              >
                {editingJobId ? "Enregistrer les modifications" : "Publier la mission"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 