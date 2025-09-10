import { useEffect, useRef, useState } from "react";
import { listResumes, getResume } from "../api";

export default function PastResumesTable() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    listResumes().then(setRows).catch(console.error);
  }, []);

  const open = async (id) => {
    try {
      const data = await getResume(id);
      setSelected(data);
      modalRef.current?.showModal();
    } catch (e) { console.error(e); }
  };

  const close = () => {
    modalRef.current?.close();
    setSelected(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>File</th>
              <th>Uploaded</th>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.file_name}</td>
                <td>{new Date(r.uploaded_at).toLocaleString()}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td><span className="badge badge-primary">{r.resume_rating ?? "—"}</span></td>
                <td><button className="btn btn-sm" onClick={() => open(r.id)}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DaisyUI modal using <dialog> */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">Resume Details</h3>
          <div className="mt-3">
            {selected ? (
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selected, null, 2)}</pre>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="loading loading-spinner loading-sm"></span>
                Loading...
              </div>
            )}
          </div>
          <div className="modal-action">
            <button className="btn" onClick={close}>Close</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
