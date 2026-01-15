import { parse } from "csv-parse";
import { access, constants, createReadStream } from "fs";
import { join } from "path";

const HABITABILITY_THRESHOLDS = {
  MIN_INSOLATION: 0.36,
  MAX_INSOLATION: 1.11,
  MAX_PLANET_RADIUS: 1.6,
};

export interface KeplerPlanet {
  kepid: string;
  kepoi_name: string;
  kepler_name: string;
  koi_disposition: string;
  koi_pdisposition: string;
  koi_score: number;
  koi_fpflag_nt: number;
  koi_fpflag_ss: number;
  koi_fpflag_co: number;
  koi_fpflag_ec: number;
  koi_period: number;
  koi_time0bk: number;
  koi_impact: number;
  koi_duration: number;
  koi_depth: number;
  koi_prad: number;
  koi_teq: number;
  koi_insol: number;
  koi_model_snr: number;
  koi_tce_plnt_num: number;
  koi_steff: number;
  koi_slogg: number;
  koi_srad: number;
  ra: number;
  dec: number;
  koi_kepmag: number;
}

function isHabitablePlanet(planet: KeplerPlanet) {
  return (
    planet.koi_disposition.toLowerCase() === "confirmed" &&
    planet.koi_insol > HABITABILITY_THRESHOLDS.MIN_INSOLATION &&
    planet.koi_insol < HABITABILITY_THRESHOLDS.MAX_INSOLATION &&
    planet.koi_prad < HABITABILITY_THRESHOLDS.MAX_PLANET_RADIUS
  );
}

async function loadPlanetsCSVFile(filePath: string): Promise<KeplerPlanet[]> {
  await access(filePath, constants.R_OK, (err) => {
    if (err) {
      throw new Error(`File at path ${filePath} is not accessible`);
    }
  });

  return new Promise<KeplerPlanet[]>((resolve, reject) => {
    const habitablePlanets: KeplerPlanet[] = [];
    createReadStream(filePath)
      .pipe(
        parse({
          comment: "#",
          columns: true,
          cast: true,
          cast_date: false,
        })
      )
      .on("data", (data: KeplerPlanet) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .on("end", () => {
        resolve(habitablePlanets);
      });
  });
}


export async function getPlanetsData(): Promise<KeplerPlanet[]> {
  const dataPath = join(process.cwd(), "data", "kepler_planets.csv");
  try {
    const habitablePlanets = await loadPlanetsCSVFile(dataPath);


    console.log("Habitable planets found:");
    habitablePlanets.forEach((planet) => {
      console.log(`  - ${planet.kepler_name || planet.kepoi_name}`);
    });
    console.log(`\nTotal Earth-like planets: ${habitablePlanets.length}`);
    return habitablePlanets;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to process planets data: ${error.message}`);
    } else {
      console.error(
        "An unknown error occurred while processing planets data.",
        error
      );
    }
    process.exit(1);
  }
}
