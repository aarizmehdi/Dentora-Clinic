const fs = require('fs');

let content = fs.readFileSync('src/context/DentoraContext.tsx', 'utf8');

// Add Firebase Auth imports
content = content.replace(
  "import { db, auth } from '../lib/firebase';",
  "import { db, auth } from '../lib/firebase';\nimport { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';"
);

// Remove mockData imports
content = content.replace(/import\s+\{[\s\S]*?\}\s+from\s+'\.\.\/data\/mockData';/m, '');

// Fix initial states
content = content.replace('useState<Organization>(mockOrganization)', 'useState<Organization | null>(null)');
content = content.replace('useState<Location[]>(mockLocations)', 'useState<Location[]>([])');
content = content.replace('useState<User | null>(mockUsers[0])', 'useState<User | null>(null)');
content = content.replace(/useState<Provider\[\]>\(mockProviders\)/g, 'useState<Provider[]>([])');
content = content.replace(/useState<Operatory\[\]>\(mockOperatories\)/g, 'useState<Operatory[]>([])');
content = content.replace(/useState<Patient\[\]>\(mockPatients\)/g, 'useState<Patient[]>([])');
content = content.replace(/useState<Appointment\[\]>\(mockAppointments\)/g, 'useState<Appointment[]>([])');
content = content.replace(/useState<ToothCondition\[\]>\(mockToothConditions\)/g, 'useState<ToothCondition[]>([])');
content = content.replace(/useState<TreatmentPlan\[\]>\(mockTreatmentPlans\)/g, 'useState<TreatmentPlan[]>([])');
content = content.replace(/useState<LedgerTransaction\[\]>\(mockLedgerTransactions\)/g, 'useState<LedgerTransaction[]>([])');
content = content.replace(/useState<ClinicalSOAPNote\[\]>\(mockSOAPNotes\)/g, 'useState<ClinicalSOAPNote[]>([])');
content = content.replace(/useState<PerioExam\[\]>\(mockPerioExams\)/g, 'useState<PerioExam[]>([])');

// Update DentoraProvider state declaration for organization to be null-safe
content = content.replace(
  'const [organization] = useState<Organization | null>(null);',
  'const [organization, setOrganization] = useState<Organization | null>(null);'
);

const authImplementation = `  // Authentication Implementation
  const login = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
  };
  
  const registerClinic = async (e: string, p: string, cn: string, an: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, e, p);
    const user = userCredential.user;
    
    // Create Clinic
    const clinicId = \`clinic_\${Date.now()}\`;
    await setDoc(doc(db, 'clinics', clinicId), {
      name: cn,
      adminEmail: e,
      createdAt: new Date().toISOString()
    });

    // Create User Doc
    await setDoc(doc(db, 'users', user.uid), {
      name: an,
      email: e,
      role: 'admin',
      clinicId: clinicId
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user doc to get clinicId
        onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setCurrentUser({...userData, id: docSnap.id});
            setCurrentRole(userData.role);
          }
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);`;

content = content.replace(
  /  \/\/ Authentication Mock Logic for MVP[\s\S]*?useEffect\(\(\) => {[\s\S]*?}, \[\]\);/m,
  authImplementation
);

fs.writeFileSync('src/context/DentoraContext.tsx', content);
console.log('Context updated successfully.');
