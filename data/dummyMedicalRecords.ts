import { MedicalRecord } from '@/types/medical';

export const dummyMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: 'p123',
    type: 'lab',
    title: 'Complete Blood Count (CBC)',
    date: '2024-03-15',
    provider: 'LifeLabs Medical',
    content: 'Comprehensive blood analysis',
    tags: ['routine', 'important'],
    doctorNotes: [
      {
        id: 'n1',
        doctorId: 'd1',
        doctorName: 'Dr. Sarah Chen',
        note: 'All values within normal range. Continue current health regimen.',
        createdAt: '2024-03-15',
        isPrivate: false,
      }
    ],
    aiInsights: {
      summary: 'Blood count values are within normal ranges, indicating good overall health.',
      status: 'normal',
      highlights: [
        {
          parameter: 'Hemoglobin',
          value: '14.2 g/dL',
          status: 'normal',
          explanation: 'Within optimal range (13.5-17.5 g/dL)'
        },
        {
          parameter: 'White Blood Cells',
          value: '7.2 K/µL',
          status: 'normal',
          explanation: 'Healthy immune system function (4.5-11.0 K/µL)'
        },
        {
          parameter: 'Platelets',
          value: '250 K/µL',
          status: 'normal',
          explanation: 'Normal platelet count (150-450 K/µL)'
        }
      ]
    }
  },
  {
    id: '2',
    patientId: 'p123',
    type: 'imaging',
    title: 'Chest X-Ray',
    date: '2024-03-10',
    provider: 'City General Hospital',
    fileUrl: 'https://example.com/xray.jpg',
    fileType: 'image/jpeg',
    tags: ['follow-up'],
    annotations: [
      {
        id: 'a1',
        doctorId: 'd2',
        text: 'No abnormalities in lung fields',
        position: { x: 120, y: 150 },
        createdAt: '2024-03-10'
      }
    ],
    doctorNotes: [
      {
        id: 'n2',
        doctorId: 'd2',
        doctorName: 'Dr. Michael Rodriguez',
        note: 'Clear lung fields. No signs of infection or abnormalities.',
        createdAt: '2024-03-10',
        isPrivate: false,
      }
    ],
    aiInsights: {
      summary: 'Chest X-ray shows clear lung fields with no significant findings.',
      status: 'normal',
      highlights: [
        {
          parameter: 'Lung Fields',
          value: 'Clear',
          status: 'normal',
          explanation: 'No infiltrates or consolidation'
        },
        {
          parameter: 'Heart Size',
          value: 'Normal',
          status: 'normal',
          explanation: 'Cardiothoracic ratio within normal limits'
        }
      ]
    }
  },
  {
    id: '3',
    patientId: 'p123',
    type: 'lab',
    title: 'Lipid Panel',
    date: '2024-03-01',
    provider: 'LifeLabs Medical',
    tags: ['chronic', 'follow-up'],
    doctorNotes: [
      {
        id: 'n3',
        doctorId: 'd1',
        doctorName: 'Dr. Sarah Chen',
        note: 'LDL slightly elevated. Recommend lifestyle modifications.',
        createdAt: '2024-03-01',
        isPrivate: false,
      }
    ],
    aiInsights: {
      summary: 'Lipid panel shows slightly elevated LDL cholesterol levels.',
      status: 'abnormal',
      highlights: [
        {
          parameter: 'Total Cholesterol',
          value: '210 mg/dL',
          status: 'abnormal',
          explanation: 'Borderline high (normal <200 mg/dL)'
        },
        {
          parameter: 'LDL Cholesterol',
          value: '140 mg/dL',
          status: 'abnormal',
          explanation: 'Above optimal range (<130 mg/dL)'
        },
        {
          parameter: 'HDL Cholesterol',
          value: '45 mg/dL',
          status: 'normal',
          explanation: 'Within acceptable range (>40 mg/dL)'
        }
      ]
    }
  },
  {
    id: '4',
    patientId: 'p123',
    type: 'vaccination',
    title: 'COVID-19 Booster',
    date: '2024-02-15',
    provider: 'Community Health Clinic',
    tags: ['important'],
    doctorNotes: [
      {
        id: 'n4',
        doctorId: 'd3',
        doctorName: 'Dr. Emily Wong',
        note: 'Administered COVID-19 booster (Pfizer). No immediate adverse reactions.',
        createdAt: '2024-02-15',
        isPrivate: false,
      }
    ]
  },
  {
    id: '5',
    patientId: 'p123',
    type: 'imaging',
    title: 'MRI - Right Knee',
    date: '2024-02-01',
    provider: 'Advanced Imaging Center',
    fileUrl: 'https://example.com/mri.jpg',
    fileType: 'image/jpeg',
    tags: ['urgent', 'follow-up'],
    annotations: [
      {
        id: 'a2',
        doctorId: 'd4',
        text: 'Partial tear in medial meniscus',
        position: { x: 200, y: 180 },
        createdAt: '2024-02-01'
      }
    ],
    doctorNotes: [
      {
        id: 'n5',
        doctorId: 'd4',
        doctorName: 'Dr. James Wilson',
        note: 'Grade 2 tear in medial meniscus. Recommend orthopedic consultation.',
        createdAt: '2024-02-01',
        isPrivate: false,
      }
    ],
    aiInsights: {
      summary: 'MRI reveals a grade 2 tear in the medial meniscus of the right knee.',
      status: 'abnormal',
      highlights: [
        {
          parameter: 'Medial Meniscus',
          value: 'Grade 2 Tear',
          status: 'abnormal',
          explanation: 'Partial thickness tear observed'
        },
        {
          parameter: 'Ligaments',
          value: 'Intact',
          status: 'normal',
          explanation: 'No ligament injuries identified'
        }
      ]
    }
  }
]; 