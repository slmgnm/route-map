import Image from "next/image";
import { SunburstChart } from "./components/SunburstChart";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Sunburst Chart</h1>
      <SunburstChart />
           
    </main>
  );
}
