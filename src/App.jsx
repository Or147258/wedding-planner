import WeddingApp from './WeddingApp';
import AuthGate from './components/auth/AuthGate';
import SetupNotice from './components/common/SetupNotice';
import { isFirebaseConfigured } from './firebase';

export default function App() {
  // בלי מפתחות Firebase אין לאן להתחבר — מציגים הוראות במקום לקרוס
  if (!isFirebaseConfigured) return <SetupNotice />;

  // האפליקציה (ולכן גם ההאזנה ל-Firestore) נטענת רק אחרי התחברות
  return <AuthGate>{(user) => <WeddingApp user={user} />}</AuthGate>;
}
