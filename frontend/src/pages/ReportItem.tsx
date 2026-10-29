import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import api from "../api/client";
import MapPicker from "../components/MapPicker";
import { detectObjects } from "../utils/objectDetection";

export default function ReportItem() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "LOST",
    location: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [detecting, setDetecting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (coords.lat !== null && coords.lng !== null) {
        formData.append("latitude", String(coords.lat));
        formData.append("longitude", String(coords.lng));
      }
      if (image) formData.append("image", image);

      await api.post("/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    if (!image) return;
    setDetecting(true);
    try {
      const objects = await detectObjects(image);
      setDetectedObjects(objects);

      if (!form.title && objects.length > 0) {
        setForm({ ...form, title: objects[0] });
      }
      if (!form.category && objects.length > 0) {
        setForm({ ...form, category: objects[0] });
      }
    } catch (err) {
      console.error("Detection failed", err);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Report an Item</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="LOST"
                checked={form.status === "LOST"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
              Lost
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="FOUND"
                checked={form.status === "FOUND"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
              Found
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Black iPhone 15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={4}
            className="w-full border rounded px-3 py-2"
            placeholder="Describe the item in detail — color, marks, contents..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Electronics, Bags..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Where was it lost/found?"
          />
        </div>

        <div>
          <MapPicker
            latitude={coords.lat}
            longitude={coords.lng}
            onChange={(lat, lng) => setCoords({ lat, lng })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
          {image && (
            <button
              type="button"
              onClick={handleDetect}
              disabled={detecting}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {detecting ? "Detecting..." : "Auto-detect objects"}
            </button>
          )}
          {detectedObjects.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detectedObjects.map((obj) => (
                <span
                  key={obj}
                  className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
                >
                  {obj}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}