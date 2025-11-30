const fs = require('fs');
const path = require('path');

const OPTIONS_FILE = path.join(__dirname, '../../../../common/database/clinical_options.json');

class ClinicalOption {
  static ensureFile() {
    if (!fs.existsSync(OPTIONS_FILE)) {
      const seed = {
        mood: ['Anxious', 'Sad', 'Cheerful', 'Agitated', 'Fearful', 'Irritable'],
        behaviour: ['Suspiciousness', 'Talking/Smiling to self', 'Hallucinatory behaviour', 'Increased goal-directed activity', 'Compulsions', 'Apathy', 'Anhedonia', 'Avolution', 'Stupor', 'Posturing', 'Stereotypy', 'Ambitendency', 'Disinhibition', 'Impulsivity', 'Anger outbursts', 'Suicide/self-harm attempts'],
        speech: ['Irrelevant', 'Incoherent', 'Pressure', 'Alogia', 'Mutism'],
        thought: ['Reference', 'Persecution', 'Grandiose', 'Love Infidelity', 'Bizarre', 'Pessimism', 'Worthlessness', 'Guilt', 'Poverty', 'Nihilism', 'Hypochondriasis', 'Wish to die', 'Active suicidal ideation', 'Plans', 'Worries', 'Obsessions', 'Phobias', 'Panic attacks'],
        perception: ['Hallucination - Auditory', 'Hallucination - Visual', 'Hallucination - Tactile', 'Hallucination - Olfactory', 'Passivity', 'Depersonalization', 'Derealization'],
        somatic: ['Pains', 'Numbness', 'Weakness', 'Fatigue', 'Tremors', 'Palpitations', 'Dyspnoea', 'Dizziness'],
        bio_functions: ['Sleep', 'Appetite', 'Bowel/Bladder', 'Self-care'],
        adjustment: ['Work output', 'Socialization'],
        cognitive_function: ['Disorientation', 'Inattention', 'Impaired Memory', 'Intelligence'],
        fits: ['Epileptic', 'Dissociative', 'Mixed', 'Not clear'],
        sexual_problem: ['Dhat', 'Poor erection', 'Early ejaculation', 'Decreased desire', 'Perversion', 'Homosexuality', 'Gender dysphoria'],
        substance_use: ['Alcohol', 'Opioid', 'Cannabis', 'Benzodiazepines', 'Tobacco'],
        associated_medical_surgical: ['Hypertension', 'Diabetes', 'Dyslipidemia', 'Thyroid dysfunction'],
        mse_behaviour: ['Uncooperative', 'Unkempt', 'Fearful', 'Odd', 'Suspicious', 'Retarded', 'Excited', 'Aggressive', 'Apathetic', 'Catatonic', 'Demonstrative'],
        mse_affect: ['Sad', 'Anxious', 'Elated', 'Inappropriate', 'Blunted', 'Labile'],
        mse_thought: ['Depressive', 'Suicidal', 'Obsessions', 'Hypochondriacal', 'Preoccupations', 'Worries'],
        mse_perception: ['Hallucinations - Auditory', 'Hallucinations - Visual', 'Hallucinations - Tactile', 'Hallucinations - Olfactory', 'Illusions', 'Depersonalization', 'Derealization'],
        mse_cognitive_function: ['Impaired', 'Not impaired'],
        past_history: [],
        family_history: []
      };
      
      // Ensure directory exists
      const dir = path.dirname(OPTIONS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(OPTIONS_FILE, JSON.stringify(seed, null, 2));
    }
  }

  static readOptions() {
    this.ensureFile();
    const raw = fs.readFileSync(OPTIONS_FILE, 'utf8');
    return JSON.parse(raw);
  }

  static writeOptions(data) {
    this.ensureFile();
    fs.writeFileSync(OPTIONS_FILE, JSON.stringify(data, null, 2));
  }

  static async getGroup(group) {
    try {
      const options = this.readOptions();
      return options[group] || [];
    } catch (error) {
      console.error('[ClinicalOption.getGroup] Error:', error);
      return [];
    }
  }

  static async addOption(group, label) {
    try {
      const options = this.readOptions();
      const list = options[group] || [];
      
      if (!list.includes(label)) {
        list.push(label);
      }
      
      options[group] = list;
      this.writeOptions(options);
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async deleteOption(group, label) {
    try {
      const options = this.readOptions();
      const list = (options[group] || []).filter((o) => o !== label);
      options[group] = list;
      this.writeOptions(options);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClinicalOption;

