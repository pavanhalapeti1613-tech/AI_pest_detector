import { PestInfo } from '../types';

export const PEST_DATABASE: Record<string, PestInfo> = {
  'Mole Cricket': {
    id: 'mole-cricket',
    commonName: 'Mole Cricket',
    scientificName: 'Gryllotalpidae (Gryllotalpa spp.)',
    localFarmerName: 'Burrowing Cricket / Root Digger Pest',
    targetCrops: ['Rice Seedlings', 'Potato & Tubers', 'Sugarcane', 'Tomato Nursery', 'Turf & Pastures'],
    urgencyLevel: 'critical',
    acousticProfile: {
      frequencyRange: '1.5 kHz – 2.8 kHz',
      soundType: 'Resonant subterranean burrow stridulation & underground purring',
      description: 'Male mole crickets carve specialized horn-shaped underground burrows that act as acoustic megaphones, amplifying low-frequency wing friction (1.8–2.3 kHz). The INMP441 microphone detects these deep underground vibrations propagating through topsoil.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'Chlorantraniliprole 18.5% SC (Soil Drench)',
        activeIngredient: 'Chlorantraniliprole (Ryanoid class)',
        recommendedDosage: '0.5 ml per 1 Liter of water (100 ml per acre)',
        applicationMethod: 'Root-zone soil drench applied in late afternoon; pre-moisten soil to encourage surface movement.',
        preHarvestInterval: '14 days before harvest',
      },
      {
        chemicalName: 'Fipronil 0.3% G (Soil Granules)',
        activeIngredient: 'Fipronil (Phenylpyrazole)',
        recommendedDosage: '8 to 10 kg granules per acre',
        applicationMethod: 'Light soil incorporation around seedbeds followed by light watering.',
        preHarvestInterval: '21 days before harvest',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Beneficial Entomopathogenic Nematodes',
        materials: 'Steinernema scapterisci or Steinernema carpocapsae nematodes',
        dosageOrSetup: '1 billion infective juveniles per acre mixed in clean irrigation water',
        applicationTiming: 'Apply at dusk onto moist soil; nematodes actively seek out subterranean mole cricket tunnels.',
      },
      {
        methodName: 'Neem Cake Soil Incorporation',
        materials: 'De-oiled pulverized neem cake meal',
        dosageOrSetup: '100 kg per acre mixed into top 5 cm of soil during land preparation',
        applicationTiming: 'Incorporate 1 week prior to sowing or transplanting nursery beds.',
      },
      {
        methodName: 'Light Trapping & Soap Flush',
        materials: 'Nocturnal incandescent light traps over soapy water trays',
        dosageOrSetup: '2 light traps per acre set 30 cm above ground level',
        applicationTiming: 'Operate from 7:00 PM to 10:00 PM during warm humid nights when adults fly.',
      },
    ],
    sprayPrecautions: [
      'Apply drench treatments at dusk or early evening when mole crickets tunnel up toward the soil surface.',
      'Always moisten the soil before chemical or nematode application so the remedy penetrates subterranean tunnels.',
      'Wear protective gloves and boots when applying granular or liquid insecticides.',
      'Do not apply directly into open drainage ditches or near fish ponds.',
    ],
    identificationTips: [
      'Small raised mounds or ridges of pushed-up loose soil on the field surface.',
      'Young seedlings cut off at soil level and pulled down into underground burrows.',
      'Heavily chewed tuber surfaces and severed fibrous roots causing patches of yellowing wilt.',
    ],
  },

  'Dragonfly': {
    id: 'dragonfly',
    commonName: 'Dragonfly',
    scientificName: 'Anisoptera (Order: Odonata)',
    localFarmerName: 'Beneficial Field Hunter / Mosquito & Moth Predator',
    targetCrops: ['Paddy Fields', 'Vegetable Plots', 'Cereal Fields', 'Wetland Borders'],
    urgencyLevel: 'beneficial',
    acousticProfile: {
      frequencyRange: '120 Hz – 380 Hz',
      soundType: 'Dual-wing pair flutter & aerial hover resonance',
      description: 'Rapid 30–40 Hz wing beats create distinctive aerodynamic flutter harmonics in the low 120–380 Hz spectrum. The INMP441 sensor detects these low-frequency acoustic vibrations when dragonflies patrol the crop canopy.',
    },
    chemicalTreatments: [
      {
        chemicalName: 'DO NOT APPLY CHEMICALS (Beneficial Insect)',
        activeIngredient: 'Natural Biological Control Agent',
        recommendedDosage: 'Zero chemical spray required',
        applicationMethod: 'Protect and conserve existing dragonfly populations in your crop fields.',
        preHarvestInterval: 'Not applicable',
      },
    ],
    organicAlternatives: [
      {
        methodName: 'Habitat Conservation & Perch Installation',
        materials: 'Bamboo or wooden field perching stakes (1.0 to 1.5 meters tall)',
        dosageOrSetup: 'Install 15 to 20 bamboo perches per acre evenly throughout the field',
        applicationTiming: 'Place perches early in the season to provide resting posts for adult dragonflies during hunting.',
      },
      {
        methodName: 'Preserve Border Water Reservoirs',
        materials: 'Clean unpolluted farm pond edges or slow-moving canal borders',
        dosageOrSetup: 'Maintain vegetation along farm canals and irrigation channels',
        applicationTiming: 'Year-round conservation to support dragonfly aquatic nymph development.',
      },
      {
        methodName: 'Eliminate Broad-Spectrum Insecticides',
        materials: 'Targeted biological controls rather than indiscriminate synthetic sprays',
        dosageOrSetup: 'Avoid pyrethroids and organophosphates when dragonfly flights are active',
        applicationTiming: 'Throughout daylight hunting hours (8:00 AM to 5:00 PM).',
      },
    ],
    sprayPrecautions: [
      'Dragonflies are voracious predators that consume leafhoppers, stem borer moths, flies, and mosquitoes.',
      'NEVER spray insecticides while dragonflies are actively flying or perching in the field.',
      'Chemical sprays kill beneficial dragonflies, leading to secondary pest resurgence.',
      'Protect natural farm pond margins where dragonfly nymphs live and eat mosquito larvae.',
    ],
    identificationTips: [
      'Large multifaceted compound eyes that touch or nearly touch at the top of the head.',
      'Two pairs of strong, transparent membranous wings held horizontally out from the body at rest.',
      'Swift, agile aerial flight with sudden hovering and rapid dives to capture flying pests in mid-air.',
    ],
  },
};

export const DEFAULT_PEST = PEST_DATABASE['Mole Cricket'];
