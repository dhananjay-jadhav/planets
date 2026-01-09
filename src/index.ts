import { parse } from "csv-parse";
import { createReadStream } from "fs";

interface KeplerPlanet {
  kepid: string;
  kepoi_name: string;
  kepler_name: string;
  koi_disposition: string;
  koi_pdisposition: string;
  koi_score: string;
  koi_fpflag_nt: string;
  koi_fpflag_ss: string;
  koi_fpflag_co: string;
  koi_fpflag_ec: string;
  koi_period: string;
  koi_time0bk: string;
  koi_impact: string;
  koi_duration: string;
  koi_depth: string;
  koi_prad: string;
  koi_teq: string;
  koi_insol: string;
  koi_model_snr: string;
  koi_tce_plnt_num: string;
  koi_steff: string;
  koi_slogg: string;
  koi_srad: string;
  ra: string;
  dec: string;
  koi_kepmag: string;
}

const results: KeplerPlanet[] = [];

function isHabitablePlanet(planet: KeplerPlanet) {
  return (
    planet.koi_disposition.toLowerCase() === "confirmed" &&
    +planet.koi_insol > 0.36 &&
    +planet.koi_insol < 1.11 &&
    +planet.koi_prad < 1.6
  );
}

createReadStream("data/kepler_planets.csv")
  .pipe(
    parse({
      comment: "#",
      columns: true,
    })
  )
  .on("data", (data) => {
    if (isHabitablePlanet(data)) {
      results.push(data);
    }
  })
  .on("error", (err) => {
    console.error(err);
  })
  .on("end", () => {
    console.log(results);
    console.log("Number of plantes like earth", results.length);
  });
