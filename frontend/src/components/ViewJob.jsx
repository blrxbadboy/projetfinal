import React from 'react';
import '../App.css';

export default function ViewJob({
  job,
  onClose,
  onEdit,
  onDelete,
  isOwner,
  onApply
}) {

  if (!job) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content view-job">
        <button onClick={onClose} className="close-btn">
          &times;
        </button>

        {job?.image && (
          <img
            src={job.image}
            alt={job?.title || "Job Image"}
            className="job-image"
          />
        )}

        <h2>{job?.title || "Titre non disponible"}</h2>

        <p className="job-budget">
          💰 {job?.budget || "N/A"}
        </p>

        <p>
          <strong>📍 Localisation:</strong> {job?.location || "Non spécifiée"}
        </p>

        <p>
          <strong>🏢 Publié par:</strong> {job?.client || "Inconnu"}
        </p>

        <h3 className="description-title">Description</h3>

        <p className="job-description">
          {job?.description || "Aucune description fournie."}
        </p>

        <div className="job-actions">
          {isOwner ? (
            <>
              <button
                onClick={() => onEdit && onEdit(job)}
                className="btn btn-warning"
              >
                Modifier
              </button>

              <button
                onClick={() => onDelete && onDelete(job?._id || job?.id)}
                className="btn btn-danger"
              >
                Supprimer
              </button>
            </>
          ) : (
            <button
              onClick={() => onApply && onApply(job)}
              className="btn btn-success full-btn"
            >
              🚀 Postuler à cette mission
            </button>
          )}
        </div>
      </div>
    </div>
  );
}