import { Route, Routes } from "react-router-dom";
import Layout from "./app/Layout.jsx";
import Activities from "./features/activities/Activities.jsx";
import DayDetail from "./features/history/DayDetail.jsx";
import History from "./features/history/History.jsx";
import Today from "./features/today/Today.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="atividades" element={<Activities />} />
        <Route path="historico" element={<History />} />
        <Route path="historico/:date" element={<DayDetail />} />
      </Route>
    </Routes>
  );
}
