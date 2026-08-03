import { CDTProcedure } from '../types/dental';

export const cdtProcedures: CDTProcedure[] = [
  { code: 'D0120', category: 'Diagnostic', description: 'Periodic Oral Evaluation', usualTimeMin: 15 },
  { code: 'D0150', category: 'Diagnostic', description: 'Comprehensive Oral Evaluation - New Patient', usualTimeMin: 30 },
  { code: 'D0210', category: 'Diagnostic', description: 'Intraoral - Complete Series of Radiographs (FMX)', usualTimeMin: 20 },
  { code: 'D0274', category: 'Diagnostic', description: 'Bitewings - Four Radiographic Images', usualTimeMin: 15 },
  { code: 'D1110', category: 'Preventive', description: 'Prophylaxis - Adult Cleaning', usualTimeMin: 45 },
  { code: 'D1206', category: 'Preventive', description: 'Topical Application of Fluoride Varnish', usualTimeMin: 10 },
  { code: 'D1351', category: 'Preventive', description: 'Pit and Fissure Sealant - Per Tooth', usualTimeMin: 15 },
  { code: 'D2391', category: 'Restorative', description: 'Resin-Based Composite - One Surface Posterior', usualTimeMin: 30 },
  { code: 'D2392', category: 'Restorative', description: 'Resin-Based Composite - Two Surfaces Posterior', usualTimeMin: 45 },
  { code: 'D2393', category: 'Restorative', description: 'Resin-Based Composite - Three Surfaces Posterior', usualTimeMin: 45 },
  { code: 'D2750', category: 'Restorative', description: 'Crown - Porcelain Fused to High Noble Metal', usualTimeMin: 60 },
  { code: 'D2950', category: 'Restorative', description: 'Core Buildup, Including Any Pins', usualTimeMin: 30 },
  { code: 'D3330', category: 'Endodontics', description: 'Endodontic Therapy - Molar Tooth', usualTimeMin: 90 },
  { code: 'D4341', category: 'Periodontics', description: 'Periodontal Scaling & Root Planing - Four or More Teeth Per Quad', usualTimeMin: 45 },
  { code: 'D6010', category: 'Prosthodontics', description: 'Surgical Placement of Implant Body: Endosteal Implant', usualTimeMin: 90 },
  { code: 'D7140', category: 'Oral Surgery', description: 'Extraction, Erupted Tooth or Exposed Root', usualTimeMin: 30 },
];
