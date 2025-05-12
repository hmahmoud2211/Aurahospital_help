// Comprehensive drugs database for the pharmacy system
export interface Drug {
  id: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  dosageStrengths: string[];
  commonDosages: string[];
  usedFor: string[];
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
}

export const drugsDatabase: Drug[] = [
  {
    id: 'drug1',
    name: 'Lisinopril',
    genericName: 'lisinopril',
    category: 'ACE Inhibitor',
    dosageForm: 'Tablet',
    dosageStrengths: ['5mg', '10mg', '20mg', '40mg'],
    commonDosages: ['Once daily', 'Twice daily'],
    usedFor: ['Hypertension', 'Heart Failure', 'Post-Myocardial Infarction'],
    sideEffects: ['Dry cough', 'Dizziness', 'Headache', 'Fatigue'],
    contraindications: ['Pregnancy', 'History of angioedema', 'Bilateral renal artery stenosis'],
    interactions: ['Potassium supplements', 'NSAIDs', 'Lithium']
  },
  {
    id: 'drug2',
    name: 'Metformin',
    genericName: 'metformin',
    category: 'Biguanide',
    dosageForm: 'Tablet',
    dosageStrengths: ['500mg', '850mg', '1000mg'],
    commonDosages: ['Once daily', 'Twice daily', 'Three times daily'],
    usedFor: ['Type 2 Diabetes', 'Insulin Resistance', 'Polycystic Ovary Syndrome'],
    sideEffects: ['Diarrhea', 'Nausea', 'Abdominal discomfort', 'Metallic taste'],
    contraindications: ['Renal impairment', 'Metabolic acidosis', 'Severe infection'],
    interactions: ['Iodinated contrast media', 'Alcohol', 'Cimetidine']
  },
  {
    id: 'drug3',
    name: 'Atorvastatin',
    genericName: 'atorvastatin',
    category: 'Statin',
    dosageForm: 'Tablet',
    dosageStrengths: ['10mg', '20mg', '40mg', '80mg'],
    commonDosages: ['Once daily'],
    usedFor: ['Hypercholesterolemia', 'Cardiovascular disease prevention', 'Atherosclerosis'],
    sideEffects: ['Muscle pain', 'Liver enzyme elevation', 'Headache', 'Joint pain'],
    contraindications: ['Active liver disease', 'Pregnancy', 'Breastfeeding'],
    interactions: ['Grapefruit juice', 'Erythromycin', 'Cyclosporine', 'Gemfibrozil']
  },
  {
    id: 'drug4',
    name: 'Amoxicillin',
    genericName: 'amoxicillin',
    category: 'Antibiotic',
    dosageForm: 'Capsule, Tablet, Suspension',
    dosageStrengths: ['250mg', '500mg', '875mg'],
    commonDosages: ['Every 8 hours', 'Every 12 hours'],
    usedFor: ['Respiratory tract infections', 'Urinary tract infections', 'Otitis media', 'Sinusitis'],
    sideEffects: ['Diarrhea', 'Rash', 'Nausea', 'Vomiting'],
    contraindications: ['Penicillin allergy', 'Infectious mononucleosis'],
    interactions: ['Probenecid', 'Oral contraceptives', 'Allopurinol']
  },
  {
    id: 'drug5',
    name: 'Omeprazole',
    genericName: 'omeprazole',
    category: 'Proton Pump Inhibitor',
    dosageForm: 'Capsule, Tablet',
    dosageStrengths: ['10mg', '20mg', '40mg'],
    commonDosages: ['Once daily', 'Twice daily'],
    usedFor: ['Gastroesophageal reflux disease (GERD)', 'Peptic ulcer disease', 'H. pylori eradication', 'Zollinger-Ellison syndrome'],
    sideEffects: ['Headache', 'Diarrhea', 'Abdominal pain', 'Nausea'],
    contraindications: ['Hypersensitivity to proton pump inhibitors'],
    interactions: ['Clopidogrel', 'Diazepam', 'Warfarin', 'Phenytoin']
  },
  {
    id: 'drug6',
    name: 'Levothyroxine',
    genericName: 'levothyroxine',
    category: 'Thyroid Hormone',
    dosageForm: 'Tablet',
    dosageStrengths: ['25mcg', '50mcg', '75mcg', '88mcg', '100mcg', '112mcg', '125mcg', '150mcg', '175mcg', '200mcg'],
    commonDosages: ['Once daily'],
    usedFor: ['Hypothyroidism', 'Thyroid hormone replacement', 'Thyroid cancer'],
    sideEffects: ['Weight loss', 'Increased appetite', 'Tremors', 'Insomnia', 'Palpitations'],
    contraindications: ['Thyrotoxicosis', 'Acute myocardial infarction'],
    interactions: ['Iron supplements', 'Calcium supplements', 'Antacids', 'Cholestyramine']
  },
  {
    id: 'drug7',
    name: 'Sertraline',
    genericName: 'sertraline',
    category: 'SSRI Antidepressant',
    dosageForm: 'Tablet',
    dosageStrengths: ['25mg', '50mg', '100mg'],
    commonDosages: ['Once daily'],
    usedFor: ['Depression', 'Anxiety disorders', 'OCD', 'PTSD', 'Panic disorder'],
    sideEffects: ['Nausea', 'Insomnia', 'Diarrhea', 'Sexual dysfunction', 'Headache'],
    contraindications: ['MAO inhibitor use within 14 days', 'Pimozide'],
    interactions: ['MAO inhibitors', 'Other SSRIs', 'NSAIDs', 'Warfarin']
  },
  {
    id: 'drug8',
    name: 'Amlodipine',
    genericName: 'amlodipine',
    category: 'Calcium Channel Blocker',
    dosageForm: 'Tablet',
    dosageStrengths: ['2.5mg', '5mg', '10mg'],
    commonDosages: ['Once daily'],
    usedFor: ['Hypertension', 'Angina', 'Coronary artery disease'],
    sideEffects: ['Peripheral edema', 'Headache', 'Dizziness', 'Flushing'],
    contraindications: ['Severe hypotension', 'Advanced aortic stenosis'],
    interactions: ['Simvastatin', 'Cyclosporine', 'Grapefruit juice']
  },
  {
    id: 'drug9',
    name: 'Albuterol',
    genericName: 'albuterol',
    category: 'Beta-2 Agonist',
    dosageForm: 'Inhaler, Nebulizer solution',
    dosageStrengths: ['90mcg/actuation', '2.5mg/3mL'],
    commonDosages: ['Every 4-6 hours as needed', 'Every 4 hours as needed'],
    usedFor: ['Asthma', 'COPD', 'Bronchospasm'],
    sideEffects: ['Tremor', 'Tachycardia', 'Nervousness', 'Headache'],
    contraindications: ['Hypersensitivity to albuterol'],
    interactions: ['Beta-blockers', 'Diuretics', 'Digoxin', 'MAO inhibitors']
  },
  {
    id: 'drug10',
    name: 'Warfarin',
    genericName: 'warfarin',
    category: 'Anticoagulant',
    dosageForm: 'Tablet',
    dosageStrengths: ['1mg', '2mg', '2.5mg', '3mg', '4mg', '5mg', '6mg', '7.5mg', '10mg'],
    commonDosages: ['Once daily'],
    usedFor: ['Atrial fibrillation', 'Deep vein thrombosis', 'Pulmonary embolism', 'Mechanical heart valves'],
    sideEffects: ['Bleeding', 'Bruising', 'Nausea', 'Abdominal pain'],
    contraindications: ['Active bleeding', 'Severe liver disease', 'Pregnancy'],
    interactions: ['NSAIDs', 'Antibiotics', 'Antifungals', 'Herbal supplements']
  },
  {
    id: 'drug11',
    name: 'Prednisone',
    genericName: 'prednisone',
    category: 'Corticosteroid',
    dosageForm: 'Tablet',
    dosageStrengths: ['1mg', '2.5mg', '5mg', '10mg', '20mg', '50mg'],
    commonDosages: ['Once daily', 'Twice daily', 'Tapering dose'],
    usedFor: ['Inflammatory conditions', 'Autoimmune disorders', 'Allergic reactions', 'Asthma exacerbations'],
    sideEffects: ['Weight gain', 'Mood changes', 'Insomnia', 'Increased blood glucose', 'Fluid retention'],
    contraindications: ['Systemic fungal infections', 'Live vaccines'],
    interactions: ['NSAIDs', 'Insulin', 'Warfarin', 'Diuretics']
  },
  {
    id: 'drug12',
    name: 'Acetaminophen',
    genericName: 'acetaminophen',
    category: 'Analgesic',
    dosageForm: 'Tablet, Capsule, Liquid',
    dosageStrengths: ['325mg', '500mg', '650mg'],
    commonDosages: ['Every 4-6 hours as needed', 'Every 6 hours as needed'],
    usedFor: ['Pain', 'Fever'],
    sideEffects: ['Liver damage (at high doses)', 'Nausea', 'Rash'],
    contraindications: ['Severe liver disease'],
    interactions: ['Alcohol', 'Warfarin', 'Isoniazid']
  },
  {
    id: 'drug13',
    name: 'Ibuprofen',
    genericName: 'ibuprofen',
    category: 'NSAID',
    dosageForm: 'Tablet, Capsule, Liquid',
    dosageStrengths: ['200mg', '400mg', '600mg', '800mg'],
    commonDosages: ['Every 4-6 hours as needed', 'Every 6-8 hours as needed', 'Three times daily'],
    usedFor: ['Pain', 'Inflammation', 'Fever'],
    sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness', 'Hypertension'],
    contraindications: ['Aspirin allergy', 'Active peptic ulcer', 'Severe heart failure'],
    interactions: ['Aspirin', 'Warfarin', 'ACE inhibitors', 'Diuretics']
  },
  {
    id: 'drug14',
    name: 'Metoprolol',
    genericName: 'metoprolol',
    category: 'Beta Blocker',
    dosageForm: 'Tablet',
    dosageStrengths: ['25mg', '50mg', '100mg', '200mg'],
    commonDosages: ['Once daily', 'Twice daily'],
    usedFor: ['Hypertension', 'Angina', 'Heart failure', 'Post-myocardial infarction'],
    sideEffects: ['Fatigue', 'Dizziness', 'Bradycardia', 'Hypotension'],
    contraindications: ['Cardiogenic shock', 'Sick sinus syndrome', 'Severe bradycardia'],
    interactions: ['Calcium channel blockers', 'Antiarrhythmics', 'Insulin', 'Digoxin']
  },
  {
    id: 'drug15',
    name: 'Furosemide',
    genericName: 'furosemide',
    category: 'Loop Diuretic',
    dosageForm: 'Tablet, Solution',
    dosageStrengths: ['20mg', '40mg', '80mg'],
    commonDosages: ['Once daily', 'Twice daily'],
    usedFor: ['Edema', 'Heart failure', 'Hypertension', 'Renal disease'],
    sideEffects: ['Dehydration', 'Electrolyte imbalances', 'Dizziness', 'Ototoxicity'],
    contraindications: ['Anuria', 'Severe electrolyte depletion'],
    interactions: ['Aminoglycosides', 'Lithium', 'Digoxin', 'NSAIDs']
  }
];

// Categorized medications for easy access
export const medicationCategories: Record<string, string[]> = {
  cardiovascular: ["drug1", "drug3", "drug8", "drug10", "drug14"],
  endocrine: ["drug2", "drug6"],
  antibiotic: ["drug4"],
  neuropsychiatric: ["drug7"],
  respiratory: ["drug9"],
  gastrointestinal: ["drug5"],
  antiinflammatory: ["drug11", "drug13", "drug12"],
  diuretic: ["drug15"]
};

// Function to search medications by name, generic name, or category
export function searchMedications(query: string): Drug[] {
  const lowerQuery = query.toLowerCase();
  return drugsDatabase.filter(drug => 
    drug.name.toLowerCase().includes(lowerQuery) || 
    drug.genericName.toLowerCase().includes(lowerQuery) ||
    drug.category.toLowerCase().includes(lowerQuery) ||
    drug.usedFor.some(use => use.toLowerCase().includes(lowerQuery))
  );
}

export function getMedicationById(id: string): Drug | undefined {
  return drugsDatabase.find(drug => drug.id === id);
}

export function getMedicationsByCategory(category: string): Drug[] {
  const medicationIds = medicationCategories[category] || [];
  return medicationIds.map(id => getMedicationById(id)).filter((drug): drug is Drug => drug !== undefined);
}

// Categorized lists for easier access
export const labTests = [
  { id: 'lab1', name: 'Complete Blood Count (CBC)' },
  { id: 'lab2', name: 'Comprehensive Metabolic Panel (CMP)' },
  { id: 'lab3', name: 'Lipid Panel' },
  { id: 'lab4', name: 'Thyroid Function Tests (TSH, T3, T4)' },
  { id: 'lab5', name: 'Hemoglobin A1C' },
  { id: 'lab6', name: 'Liver Function Tests' },
  { id: 'lab7', name: 'Renal Function Panel' },
  { id: 'lab8', name: 'Urinalysis' },
  { id: 'lab9', name: 'Coagulation Studies (PT/INR)' },
  { id: 'lab10', name: 'C-Reactive Protein (CRP)' },
  { id: 'lab11', name: 'Erythrocyte Sedimentation Rate (ESR)' },
  { id: 'lab12', name: 'Blood Culture' },
  { id: 'lab13', name: 'Urine Culture' },
  { id: 'lab14', name: 'Throat Culture' },
  { id: 'lab15', name: 'COVID-19 PCR Test' },
  { id: 'lab16', name: 'HIV Test' },
  { id: 'lab17', name: 'Hepatitis Panel' },
  { id: 'lab18', name: 'Vitamin D Level' },
  { id: 'lab19', name: 'Vitamin B12 Level' },
  { id: 'lab20', name: 'Ferritin Level' },
  { id: 'other_lab', name: 'Other (Custom)' }
];

export const imagingTests = [
  { id: 'img1', name: 'Chest X-Ray' },
  { id: 'img2', name: 'Abdominal X-Ray' },
  { id: 'img3', name: 'CT Scan - Head' },
  { id: 'img4', name: 'CT Scan - Chest' },
  { id: 'img5', name: 'CT Scan - Abdomen/Pelvis' },
  { id: 'img6', name: 'MRI - Brain' },
  { id: 'img7', name: 'MRI - Spine' },
  { id: 'img8', name: 'MRI - Knee' },
  { id: 'img9', name: 'MRI - Shoulder' },
  { id: 'img10', name: 'Ultrasound - Abdomen' },
  { id: 'img11', name: 'Ultrasound - Pelvis' },
  { id: 'img12', name: 'Ultrasound - Thyroid' },
  { id: 'img13', name: 'Ultrasound - Breast' },
  { id: 'img14', name: 'Mammogram' },
  { id: 'img15', name: 'Bone Density Scan (DEXA)' },
  { id: 'img16', name: 'Echocardiogram' },
  { id: 'img17', name: 'Nuclear Stress Test' },
  { id: 'img18', name: 'PET Scan' },
  { id: 'img19', name: 'Colonoscopy' },
  { id: 'img20', name: 'Upper Endoscopy' },
  { id: 'other_img', name: 'Other (Custom)' }
]; 