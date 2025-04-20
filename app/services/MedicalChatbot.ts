import axios from 'axios';

interface MedicalResponse {
  response: string;
  confidence: number;
  source?: string;
  isAppointmentRequest?: boolean;
  appointmentOptions?: AppointmentSlot[];
  additionalInfo?: {
    symptoms?: string[];
    treatments?: string[];
    prevention?: string[];
    references?: string[];
    severity?: string;
  };
}

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
}

interface BaseCondition {
  symptoms?: string;
  prevention?: string;
  treatment?: string;
}

interface DiabetesInfo extends BaseCondition {
  types: string;
}

interface HypertensionInfo extends BaseCondition {
  causes: string;
  monitoring: string;
}

interface HeadacheInfo {
  types: string;
  treatment: string;
  prevention: string;
}

interface FeverInfo {
  general: string;
  severity: {
    mild: string;
    moderate: string;
    high: string;
  };
  treatment: string;
}

interface MentalHealthInfo {
  depression: {
    symptoms: string;
    treatment: string;
    when_to_seek_help: string;
  };
  anxiety: {
    symptoms: string;
    management: string;
    treatment: string;
  };
}

interface PediatricInfo {
  development: {
    walking: string;
    growth: string;
    vaccinations: string;
  };
  fever: {
    guidelines: string;
    treatment: string;
  };
}

interface WomensHealthInfo {
  mammogram: {
    frequency: string;
    importance: string;
  };
  pregnancy: {
    early_symptoms: string;
    prenatal_care: string;
    monitoring: string;
  };
}

interface PreventiveCareInfo {
  physical_exam: {
    frequency: string;
    components: string;
  };
  dental: {
    checkups: string;
    importance: string;
  };
  adult_vaccines: {
    recommended: string;
    schedule: string;
  };
}

interface MedicalKnowledgeBase {
  diabetes: DiabetesInfo;
  hypertension: HypertensionInfo;
  asthma: BaseCondition;
  heart_disease: BaseCondition;
  flu: BaseCondition;
  headache: HeadacheInfo;
  fever: FeverInfo;
  mental_health: MentalHealthInfo;
  pediatric: PediatricInfo;
  womens_health: WomensHealthInfo;
  preventive_care: PreventiveCareInfo;
}

export class MedicalChatbot {
  // Only using the most reliable APIs
  private readonly MEDICAL_INFO_API = 'https://clinicaltables.nlm.nih.gov/api/conditions/v3/search';
  private readonly DRUG_INFO_API = 'https://rxnav.nlm.nih.gov/REST/drugs.json';
  private readonly MEDICAL_ENCYCLOPEDIA_API = 'https://medlineplus.gov/api/v1/encyclopedia.json';
  private readonly WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
  private readonly OPENFDA_API = 'https://api.fda.gov/drug/label.json';

  // Expanded medical knowledge base
  private readonly MEDICAL_KNOWLEDGE: MedicalKnowledgeBase = {
    diabetes: {
      symptoms: "Common symptoms of diabetes include increased thirst, frequent urination, extreme hunger, unexplained weight loss, fatigue, irritability, blurred vision, slow-healing sores, and frequent infections.",
      prevention: "To prevent type 2 diabetes: maintain a healthy weight, exercise regularly, eat a balanced diet, and avoid smoking.",
      treatment: "Treatment includes monitoring blood sugar, healthy eating, regular exercise, and possibly medication or insulin therapy.",
      types: "Type 1 diabetes is an autoimmune condition where the body doesn't produce insulin, while Type 2 diabetes develops when the body becomes resistant to insulin or doesn't make enough insulin."
    },
    hypertension: {
      symptoms: "High blood pressure often has no symptoms. When symptoms do occur, they may include headaches, shortness of breath, or nosebleeds.",
      prevention: "Prevent hypertension by maintaining a healthy weight, reducing salt intake, exercising regularly, limiting alcohol, and managing stress.",
      treatment: "Treatment includes lifestyle changes and possibly medication. Regular monitoring is important.",
      causes: "Causes include age, family history, obesity, lack of exercise, high-sodium diet, stress, and certain medical conditions.",
      monitoring: "Check blood pressure at least once a year if normal, more frequently if elevated or if you have risk factors."
    },
    asthma: {
      symptoms: "Symptoms include shortness of breath, chest tightness, wheezing, and coughing, especially at night or early morning.",
      prevention: "Prevent asthma attacks by identifying and avoiding triggers, taking prescribed medications, and having an action plan.",
      treatment: "Treatment includes quick-relief inhalers, long-term control medications, and avoiding triggers."
    },
    heart_disease: {
      symptoms: "Symptoms may include chest pain, shortness of breath, pain in the neck, jaw, throat, upper abdomen, or back.",
      prevention: "Prevent heart disease by not smoking, controlling blood pressure and cholesterol, managing diabetes, exercising, and eating healthy.",
      treatment: "Treatment includes lifestyle changes, medications, medical procedures, and possibly surgery."
    },
    flu: {
      symptoms: "Symptoms include fever, chills, muscle aches, cough, congestion, runny nose, headaches, and fatigue.",
      prevention: "Get vaccinated annually, wash hands frequently, avoid close contact with sick people, and stay home when sick.",
      treatment: "Rest, fluids, and over-the-counter medications can help. Antiviral drugs may be prescribed in some cases."
    },
    headache: {
      types: "Common types include tension headaches, migraines, and cluster headaches.",
      treatment: "Treatment options include over-the-counter pain relievers, rest, hydration, and stress management. For severe or recurring headaches, consult a healthcare provider.",
      prevention: "Identify and avoid triggers, maintain regular sleep schedule, stay hydrated, manage stress, and practice good posture."
    },
    fever: {
      general: "Normal body temperature varies but is generally considered to be 98.6°F (37°C). Fever is usually defined as 100.4°F (38°C) or higher.",
      severity: {
        mild: "100.4°F-102.2°F (38°C-39°C): Generally not concerning in healthy adults",
        moderate: "102.2°F-104°F (39°C-40°C): May require treatment",
        high: "Above 104°F (40°C): Requires immediate medical attention"
      },
      treatment: "Rest, hydration, and fever-reducing medications if needed. For children, follow age-appropriate dosing guidelines."
    },
    mental_health: {
      depression: {
        symptoms: "Persistent sadness, loss of interest, changes in sleep or appetite, difficulty concentrating, feelings of worthlessness, and thoughts of death or suicide.",
        treatment: "Treatment may include therapy, medication, lifestyle changes, and support groups.",
        when_to_seek_help: "Seek help if symptoms persist for more than two weeks or affect daily functioning."
      },
      anxiety: {
        symptoms: "Excessive worry, restlessness, difficulty concentrating, sleep problems, and physical symptoms like rapid heartbeat or sweating.",
        management: "Management strategies include therapy, medication, relaxation techniques, regular exercise, and stress management.",
        treatment: "Professional treatment options include cognitive behavioral therapy (CBT) and anti-anxiety medications."
      }
    },
    pediatric: {
      development: {
        walking: "Most babies take their first steps between 9-15 months and are walking well by 14-15 months.",
        growth: "Growth patterns vary but should follow consistent percentile curves on growth charts.",
        vaccinations: "Follow the CDC-recommended vaccination schedule, starting at birth through adolescence."
      },
      fever: {
        guidelines: "For infants under 3 months, any fever (100.4°F/38°C or higher) requires immediate medical attention. For older children, consider other symptoms and behavior.",
        treatment: "Use age-appropriate fever reducers, ensure hydration, and monitor for signs of serious illness."
      }
    },
    womens_health: {
      mammogram: {
        frequency: "Women aged 40-74 should get mammograms every 2 years. Those with high risk factors may need to start earlier or screen more frequently.",
        importance: "Regular mammograms are key for early detection of breast cancer."
      },
      pregnancy: {
        early_symptoms: "Common early signs include missed period, fatigue, nausea, breast tenderness, and frequent urination.",
        prenatal_care: "Start prenatal care as soon as pregnancy is confirmed, ideally within the first 8 weeks.",
        monitoring: "Regular check-ups throughout pregnancy to monitor both mother and baby's health."
      }
    },
    preventive_care: {
      physical_exam: {
        frequency: "Adults should get a physical exam every 1-3 years, depending on age and health status.",
        components: "Includes vital signs, physical examination, health history review, and preventive screenings."
      },
      dental: {
        checkups: "Regular dental checkups and cleanings every 6 months, unless otherwise recommended by your dentist.",
        importance: "Prevents cavities, gum disease, and identifies oral health issues early."
      },
      adult_vaccines: {
        recommended: "Include flu shot annually, Td/Tdap every 10 years, and others based on age, health conditions, and risk factors.",
        schedule: "Follow CDC-recommended adult immunization schedule."
      }
    }
  };

  // Mock data for doctors and appointments
  private readonly DOCTORS = [
    { id: 'd1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', availableDays: ['Monday', 'Wednesday', 'Friday'] },
    { id: 'd2', name: 'Dr. Michael Chen', specialty: 'General Medicine', availableDays: ['Tuesday', 'Thursday', 'Saturday'] },
    { id: 'd3', name: 'Dr. Emily Brown', specialty: 'Pediatrics', availableDays: ['Monday', 'Wednesday', 'Friday'] },
  ];

  private readonly APPOINTMENT_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  private appointments: Appointment[] = [];

  private readonly EMERGENCY_SYMPTOMS = {
    chest_pain: {
      severity: 'emergency',
      response: "EMERGENCY: Chest pain could indicate a heart attack. Call emergency services (911) immediately. While waiting:\n" +
        "1. Sit or lie down and try to stay calm\n" +
        "2. Take aspirin if recommended by emergency services\n" +
        "3. Loosen any tight clothing\n" +
        "4. Have someone stay with you until help arrives",
      symptoms: ['chest pain', 'chest pressure', 'chest tightness', 'chest discomfort']
    },
    difficulty_breathing: {
      severity: 'emergency',
      response: "EMERGENCY: Difficulty breathing requires immediate medical attention. Call emergency services (911) immediately. While waiting:\n" +
        "1. Sit upright to help ease breathing\n" +
        "2. Loosen any tight clothing around neck/chest\n" +
        "3. Stay calm to avoid worsening breathlessness\n" +
        "4. If you have asthma, use your rescue inhaler as prescribed",
      symptoms: ['difficulty breathing', 'shortness of breath', 'can\'t breathe', 'trouble breathing']
    },
    high_fever_child: {
      severity: 'urgent',
      response: "URGENT: For a child with very high fever:\n" +
        "1. If temperature is above 104°F (40°C), seek immediate medical care\n" +
        "2. For infants under 3 months with any fever, go to emergency room\n" +
        "3. Keep the child hydrated and lightly dressed\n" +
        "4. Use age-appropriate fever reducers (consult with doctor/pharmacist)\n" +
        "Monitor for signs of dehydration or worsening symptoms",
      symptoms: ['child fever', 'baby fever', 'infant fever', 'high fever child']
    },
    severe_abdominal_pain: {
      severity: 'urgent',
      response: "URGENT: Severe abdominal pain requires prompt medical attention. If pain is sudden and severe:\n" +
        "1. Do not eat or drink anything\n" +
        "2. Do not take pain medications\n" +
        "3. Note the pain location and any other symptoms\n" +
        "4. Seek immediate medical care, especially if accompanied by:\n" +
        "   - Fever\n" +
        "   - Vomiting\n" +
        "   - Blood in stool\n" +
        "   - Swollen abdomen",
      symptoms: ['severe abdominal pain', 'severe stomach pain', 'intense belly pain']
    }
  };

  async getMedicalResponse(query: string): Promise<MedicalResponse> {
    try {
      // Check for emergency symptoms first
      const emergencyResponse = this.checkEmergencySymptoms(query);
      if (emergencyResponse) {
        return emergencyResponse;
      }

      const lowerQuery = query.toLowerCase();

      // Check appointment requests
      if (this.isAppointmentRequest(lowerQuery)) {
        return await this.handleAppointmentRequest(query);
      }

      // Check specialized advice handlers
      const lifestyleAdvice = this.getHealthyLifestyleAdvice(query);
      if (lifestyleAdvice) return lifestyleAdvice;

      const medicationAdvice = this.getMedicationAdvice(query);
      if (medicationAdvice) return medicationAdvice;

      const chronicConditionAdvice = this.getChronicConditionAdvice(query);
      if (chronicConditionAdvice) return chronicConditionAdvice;

      // Check medical knowledge base
      const knowledgeResponse = this.checkMedicalKnowledge(query);
      if (knowledgeResponse) {
        return knowledgeResponse;
      }

      // Try external APIs if no local knowledge found
      const medicalInfo = await this.getMedicalInfo(query);
      if (medicalInfo) {
        return {
          response: medicalInfo,
          confidence: 0.9,
          source: 'Medical Knowledge Base'
        };
      }

      // Default response
      return {
        response: "I understand you're asking about medical information. For accurate medical advice, please consult with a healthcare professional. I can help you schedule an appointment with a doctor to discuss your concerns.",
        confidence: 0.7,
        source: 'General Response'
      };
    } catch (error) {
      console.error('Error in medical response:', error);
      return {
        response: "I apologize, but I'm having trouble processing your query. Please try rephrasing your question or consult with a healthcare professional.",
        confidence: 0.5,
        source: 'Error Handler'
      };
    }
  }

  private async getMedicalInfo(query: string): Promise<string | null> {
    try {
      const response = await axios.get(this.MEDICAL_INFO_API, {
        params: {
          terms: query,
          maxList: 1,
          format: 'json'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data[3] && response.data[3].length > 0) {
        return response.data[3][0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching medical info:', error);
      return null;
    }
  }

  private async getDrugInfo(drugName: string): Promise<string | null> {
    try {
      const response = await axios.get(this.DRUG_INFO_API, {
        params: {
          name: drugName,
          limit: 1
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.drugGroup && response.data.drugGroup.conceptGroup) {
        const drugInfo = response.data.drugGroup.conceptGroup[0]?.conceptProperties?.[0];
        if (drugInfo) {
          return `Drug: ${drugInfo.name}\nRXCUI: ${drugInfo.rxcui}\nSynonym: ${drugInfo.synonym || 'N/A'}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching drug info:', error);
      return null;
    }
  }

  private async getEncyclopediaInfo(query: string): Promise<string | null> {
    try {
      const response = await axios.get(this.MEDICAL_ENCYCLOPEDIA_API, {
        params: {
          q: query,
          limit: 1
        }
      });

      if (response.data && response.data.encyclopedia && response.data.encyclopedia.length > 0) {
        const article = response.data.encyclopedia[0];
        return `Title: ${article.title}\nSummary: ${article.summary}`;
      }
      return null;
    } catch (error) {
      console.error('Error fetching encyclopedia info:', error);
      return null;
    }
  }

  private checkMedicalKnowledge(query: string): MedicalResponse | null {
    const lowerQuery = query.toLowerCase();
    
    // Check for specific conditions
    for (const [condition, info] of Object.entries(this.MEDICAL_KNOWLEDGE)) {
      if (lowerQuery.includes(condition)) {
        if (lowerQuery.includes('symptom')) {
          return {
            response: `Symptoms of ${condition}: ${info.symptoms}`,
            confidence: 0.95,
            source: 'Medical Knowledge Base'
          };
        }
        if (lowerQuery.includes('prevent') || lowerQuery.includes('prevention')) {
          return {
            response: `Prevention of ${condition}: ${info.prevention}`,
            confidence: 0.95,
            source: 'Medical Knowledge Base'
          };
        }
        if (lowerQuery.includes('treat') || lowerQuery.includes('treatment')) {
          return {
            response: `Treatment for ${condition}: ${info.treatment}`,
            confidence: 0.95,
            source: 'Medical Knowledge Base'
          };
        }
        return {
          response: `About ${condition}:\nSymptoms: ${info.symptoms}\nPrevention: ${info.prevention}\nTreatment: ${info.treatment}`,
          confidence: 0.95,
          source: 'Medical Knowledge Base'
        };
      }
    }

    // Check for general health questions
    if (lowerQuery.includes('water') && lowerQuery.includes('drink')) {
      return {
        response: "The general recommendation is to drink about 8 glasses (2 liters) of water per day. However, individual needs may vary based on activity level, climate, and health conditions.",
        confidence: 0.9,
        source: 'Medical Knowledge Base'
      };
    }

    if (lowerQuery.includes('exercise') || lowerQuery.includes('workout')) {
      return {
        response: "Regular exercise benefits include: improved heart health, weight management, better mood, stronger bones and muscles, and reduced risk of chronic diseases. Aim for at least 150 minutes of moderate exercise per week.",
        confidence: 0.9,
        source: 'Medical Knowledge Base'
      };
    }

    if (lowerQuery.includes('sleep')) {
      return {
        response: "Adults typically need 7-9 hours of sleep per night. Good sleep hygiene includes: maintaining a regular sleep schedule, creating a comfortable sleep environment, limiting screen time before bed, and avoiding caffeine and large meals before bedtime.",
        confidence: 0.9,
        source: 'Medical Knowledge Base'
      };
    }

    return null;
  }

  private checkEmergencySymptoms(query: string): MedicalResponse | null {
    const lowerQuery = query.toLowerCase();
    
    for (const [condition, info] of Object.entries(this.EMERGENCY_SYMPTOMS)) {
      if (info.symptoms.some(symptom => lowerQuery.includes(symptom))) {
        return {
          response: info.response,
          confidence: 1.0,
          source: 'Emergency Protocol',
          additionalInfo: {
            severity: info.severity,
            symptoms: info.symptoms,
            references: ['Emergency Services: 911']
          }
        };
      }
    }
    return null;
  }

  async getAvailableAppointments(doctorId?: string, date?: string): Promise<AppointmentSlot[]> {
    try {
      const availableSlots: AppointmentSlot[] = [];
      const targetDate = date ? new Date(date) : new Date();
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Filter doctors based on availability and specialty
      const availableDoctors = this.DOCTORS.filter(doctor => 
        (!doctorId || doctor.id === doctorId) && 
        doctor.availableDays.includes(dayOfWeek)
      );

      // Generate available slots for each doctor
      for (const doctor of availableDoctors) {
        for (const time of this.APPOINTMENT_SLOTS) {
          const slotId = `${doctor.id}-${targetDate.toISOString().split('T')[0]}-${time}`;
          const isBooked = this.appointments.some(appt => 
            appt.doctorId === doctor.id && 
            appt.date === targetDate.toISOString().split('T')[0] && 
            appt.time === time
          );

          availableSlots.push({
            id: slotId,
            date: targetDate.toISOString().split('T')[0],
            time,
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            isAvailable: !isBooked
          });
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error fetching available appointments:', error);
      return [];
    }
  }

  async bookAppointment(patientId: string, slotId: string, reason: string): Promise<Appointment | null> {
    try {
      const [doctorId, date, time] = slotId.split('-');
      const doctor = this.DOCTORS.find(d => d.id === doctorId);

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Check if slot is still available
      const isBooked = this.appointments.some(appt => 
        appt.doctorId === doctorId && 
        appt.date === date && 
        appt.time === time
      );

      if (isBooked) {
        throw new Error('Appointment slot is no longer available');
      }

      const newAppointment: Appointment = {
        id: `appt-${Date.now()}`,
        patientId,
        doctorId,
        date,
        time,
        status: 'scheduled',
        reason
      };

      this.appointments.push(newAppointment);
      return newAppointment;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return null;
    }
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const appointmentIndex = this.appointments.findIndex(appt => appt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      this.appointments[appointmentIndex].status = 'cancelled';
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      return this.appointments.filter(appt => appt.patientId === patientId);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  // Additional specialized response handlers
  private getHealthyLifestyleAdvice(query: string): MedicalResponse | null {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('water') && lowerQuery.includes('drink')) {
      return {
        response: "The general recommendation is to drink about 8 glasses (2 liters) of water per day. However, individual needs may vary based on activity level, climate, and health conditions. Signs of adequate hydration include light-colored urine and rarely feeling thirsty.",
        confidence: 0.9,
        source: 'Lifestyle Guidelines'
      };
    }

    if (lowerQuery.includes('back pain') && lowerQuery.includes('exercise')) {
      return {
        response: "Exercises good for back pain include:\n1. Gentle stretching\n2. Walking\n3. Swimming\n4. Core strengthening exercises\n5. Low-impact aerobic activities\nAlways start slowly and consult a healthcare provider before beginning a new exercise routine.",
        confidence: 0.9,
        source: 'Exercise Guidelines'
      };
    }

    if (lowerQuery.includes('sleep')) {
      return {
        response: "To improve sleep:\n1. Maintain a consistent sleep schedule\n2. Create a relaxing bedtime routine\n3. Keep bedroom cool, dark, and quiet\n4. Limit screen time before bed\n5. Avoid caffeine and large meals before bedtime\n6. Exercise regularly, but not close to bedtime\nAdults typically need 7-9 hours of sleep per night.",
        confidence: 0.9,
        source: 'Sleep Guidelines'
      };
    }

    return null;
  }

  private getMedicationAdvice(query: string): MedicalResponse | null {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('ibuprofen') && lowerQuery.includes('side effects')) {
      return {
        response: "Common side effects of ibuprofen include:\n1. Stomach pain or upset\n2. Heartburn\n3. Nausea\n4. Headache\n5. Dizziness\nSerious side effects requiring immediate medical attention:\n- Black/bloody stools\n- Severe stomach pain\n- Vomiting blood\n- Signs of kidney problems\nAlways take as directed and consult healthcare provider for prolonged use.",
        confidence: 0.9,
        source: 'Medication Guidelines'
      };
    }

    if (lowerQuery.includes('antibiotics')) {
      return {
        response: "Important antibiotic guidelines:\n1. Take exactly as prescribed\n2. Complete the full course, even if feeling better\n3. Take at regular intervals as directed\n4. Don't skip doses\n5. Don't save antibiotics for later use\n6. Don't take antibiotics prescribed for others\nConsult your healthcare provider for specific instructions.",
        confidence: 0.9,
        source: 'Medication Guidelines'
      };
    }

    return null;
  }

  private getChronicConditionAdvice(query: string): MedicalResponse | null {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('diabetes') && lowerQuery.includes('blood pressure')) {
      return {
        response: "Precautions for managing diabetes and high blood pressure:\n1. Monitor both blood sugar and blood pressure regularly\n2. Take all medications as prescribed\n3. Maintain a heart-healthy diet low in sodium\n4. Exercise regularly with doctor's approval\n5. Keep all medical appointments\n6. Monitor weight\n7. Quit smoking if applicable\n8. Limit alcohol intake\nRegular check-ups with healthcare providers are essential.",
        confidence: 0.95,
        source: 'Chronic Disease Management'
      };
    }

    if (lowerQuery.includes('stress') && lowerQuery.includes('physical')) {
      return {
        response: "Physical symptoms of stress can include:\n1. Headaches\n2. Muscle tension or pain\n3. Chest pain\n4. Fatigue\n5. Sleep problems\n6. Stomach upset\n7. Changes in appetite\nManagement strategies:\n- Regular exercise\n- Relaxation techniques\n- Adequate sleep\n- Healthy diet\n- Professional counseling if needed",
        confidence: 0.9,
        source: 'Stress Management'
      };
    }

    return null;
  }

  private isAppointmentRequest(query: string): boolean {
    const appointmentKeywords = [
      'appointment',
      'schedule',
      'book',
      'reserve',
      'see a doctor',
      'visit',
      'consultation'
    ];
    return appointmentKeywords.some(keyword => query.includes(keyword));
  }

  private async handleAppointmentRequest(query: string): Promise<MedicalResponse> {
    try {
      // Get available appointments for the next 7 days
      const availableSlots = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const slots = await this.getAvailableAppointments(undefined, date.toISOString());
        availableSlots.push(...slots);
      }

      if (availableSlots.length > 0) {
        // Format available slots into a readable message
        const formattedSlots = availableSlots
          .filter(slot => slot.isAvailable)
          .slice(0, 5) // Show only first 5 available slots
          .map(slot => `\n- ${slot.doctorName} (${slot.specialty})\n  ${new Date(slot.date).toLocaleDateString()} at ${slot.time}`);

        return {
          response: `Here are some available appointment slots:${formattedSlots.join('\n')}\n\nTo book an appointment, please select a time slot or let me know your preferred date and doctor.`,
          confidence: 0.9,
          source: 'Appointment System',
          isAppointmentRequest: true,
          appointmentOptions: availableSlots.filter(slot => slot.isAvailable).slice(0, 5)
        };
      } else {
        return {
          response: "I couldn't find any available appointments in the next 7 days. Would you like to check for later dates or specific doctors?",
          confidence: 0.8,
          source: 'Appointment System',
          isAppointmentRequest: true
        };
      }
    } catch (error) {
      console.error('Error handling appointment request:', error);
      return {
        response: "I apologize, but I'm having trouble processing your appointment request. Please try rephrasing your question or consult with a healthcare professional.",
        confidence: 0.5,
        source: 'Error Handler'
      };
    }
  }
} 