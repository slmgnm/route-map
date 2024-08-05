import Image from "next/image";
import { SunburstChart } from "./components/SunburstChart";
import SunburstChartZ from "./components/SunburstAnyChart";
import data from "./data.json";
import Routes from "./components/Routes";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <h1 className="text-4xl font-bold">Sunburst Chart</h1> */}
      {/* <SunburstChartZ data={data}/> */}
      <Routes />
    </main>
  );
}
