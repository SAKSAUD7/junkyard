import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ApiError, checkBackend } from "./src/api/client";
import { createVehicleSubmission, type CreatedVehicleSubmission, type VehicleSubmission } from "./src/api/vehicleSubmissions";

const initialForm: VehicleSubmission = {
  vin: "", year: new Date().getFullYear(), make: "", model: "", trim: "", mileage: "",
  drivable: false, starts: true, transportation_required: false, has_title: false,
  has_keys: false, has_all_tires: false, body_damage: "None", engine_issue: false,
  transmission_issue: false, name: "", email: "", phone: "", zip_code: "",
  state: "", city: "", description: "",
};

const conditionOptions = ["None", "Minor", "Moderate", "Severe"];

function VehicleApp() {
  const [form, setForm] = useState<VehicleSubmission>(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<CreatedVehicleSubmission | null>(null);
  const [backendState, setBackendState] = useState<"unknown" | "checking" | "available" | "unavailable">("unknown");
  const submitLock = useRef(false);

  const update = <K extends keyof VehicleSubmission,>(key: K, value: VehicleSubmission[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const verifyBackend = async () => {
    setBackendState("checking");
    try {
      await checkBackend();
      setBackendState("available");
    } catch (error) {
      setBackendState("unavailable");
      setMessage(error instanceof Error ? error.message : "Could not check JYNM server status.");
    }
  };

  const validate = (): string => {
    if (!form.make.trim() || !form.model.trim()) return "Enter the vehicle make and model.";
    if (!Number.isInteger(form.year) || form.year < 1900 || form.year > new Date().getFullYear() + 1) return "Enter a valid model year.";
    if (form.vin.trim() && form.vin.trim().length !== 17) return "VIN must contain 17 characters, or be left blank.";
    if (!form.mileage.trim()) return "Enter the vehicle mileage.";
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return "Enter your name, email, and phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!form.zip_code.trim() || !form.state.trim() || !form.city.trim()) return "Enter your ZIP code, state, and city.";
    return "";
  };

  const submit = async () => {
    if (submitLock.current) return;
    const validationError = validate();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    submitLock.current = true;
    setLoading(true);
    setMessage("");
    try {
      const created = await createVehicleSubmission({
        ...form,
        vin: form.vin.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        trim: form.trim.trim(),
        mileage: form.mileage.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        zip_code: form.zip_code.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
      });
      setSuccess(created);
      setBackendState("available");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Submission failed. Please try again later.");
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };

  const startAnother = () => {
    setForm(initialForm);
    setSuccess(null);
    setMessage("");
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f4f7fb" />
        <View style={styles.successWrap}>
          <Text style={styles.successIcon} accessibilityLabel="Success">✓</Text>
          <Text style={styles.title}>Submission received</Text>
          <Text style={styles.body}>Your {success.year} {success.make} {success.model} details were sent to JYNM.</Text>
          <Text style={styles.reference}>Reference #{success.id}</Text>
          <Text style={styles.body}>The existing JYNM team will review it through the current vehicle-lead workflow.</Text>
          <PrimaryButton label="Submit another vehicle" onPress={startAnother} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f4f7fb" />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><Text style={styles.brandMarkText}>J</Text></View>
              <View><Text style={styles.brand}>JYNM</Text><Text style={styles.brandSub}>SELL YOUR VEHICLE</Text></View>
            </View>

            <View style={styles.headingBlock}>
              <Text style={styles.eyebrow}>VEHICLE SELLER INTAKE</Text>
              <Text style={styles.title}>Tell us about your vehicle</Text>
              <Text style={styles.body}>Submit your details securely to the existing JYNM vehicle-lead system.</Text>
            </View>

            <View style={styles.healthCard}>
              <View style={[styles.healthDot, backendState === "available" ? styles.healthGood : backendState === "unavailable" ? styles.healthBad : null]} />
              <Text style={styles.healthLabel}>
                {backendState === "available" ? "JYNM backend available" : backendState === "checking" ? "Checking backend…" : backendState === "unavailable" ? "Backend unavailable" : "Backend status not checked"}
              </Text>
              <Text onPress={verifyBackend} accessibilityRole="button" style={styles.healthAction}>
                {backendState === "checking" ? "" : "Check"}
              </Text>
            </View>

            {message ? <View style={styles.errorBox} accessibilityRole="alert"><Text style={styles.errorText}>{message}</Text></View> : null}

            <Section title="1 · Vehicle details" description="Enter the vehicle information you would provide on the JYNM website.">
              <Field label="VIN (optional)" value={form.vin} onChangeText={(value) => update("vin", value.toUpperCase().slice(0, 17))} placeholder="17-character VIN" autoCapitalize="characters" maxLength={17} />
              <View style={styles.twoColumns}>
                <View style={styles.column}><Field label="Year" value={String(form.year)} onChangeText={(value) => update("year", Number(value) || 0)} keyboardType="number-pad" placeholder="2020" /></View>
                <View style={styles.column}><Field label="Make" value={form.make} onChangeText={(value) => update("make", value)} placeholder="Ford" /></View>
              </View>
              <View style={styles.twoColumns}>
                <View style={styles.column}><Field label="Model" value={form.model} onChangeText={(value) => update("model", value)} placeholder="F-150" /></View>
                <View style={styles.column}><Field label="Trim (optional)" value={form.trim} onChangeText={(value) => update("trim", value)} placeholder="XLT" /></View>
              </View>
            </Section>

            <Section title="2 · Condition and location" description="These fields match the existing sell-your-car form and backend contract.">
              <Field label="Mileage" value={form.mileage} onChangeText={(value) => update("mileage", value)} keyboardType="number-pad" placeholder="e.g. 120000" />
              <Text style={styles.label}>Body damage</Text>
              <View style={styles.optionRow}>
                {conditionOptions.map((option) => (
                  <Text key={option} onPress={() => update("body_damage", option)} accessibilityRole="button" accessibilityState={{ selected: form.body_damage === option }} style={[styles.option, form.body_damage === option && styles.optionSelected]}>{option}</Text>
                ))}
              </View>
              <SwitchField label="Vehicle is drivable" value={form.drivable} onValueChange={(value) => update("drivable", value)} />
              <SwitchField label="Engine starts" value={form.starts} onValueChange={(value) => update("starts", value)} />
              <SwitchField label="Transportation / towing required" value={form.transportation_required} onValueChange={(value) => update("transportation_required", value)} />
              <SwitchField label="I have the title" value={form.has_title} onValueChange={(value) => update("has_title", value)} />
              <SwitchField label="I have the keys" value={form.has_keys} onValueChange={(value) => update("has_keys", value)} />
              <SwitchField label="All tires are present" value={form.has_all_tires} onValueChange={(value) => update("has_all_tires", value)} />
              <SwitchField label="Engine issue" value={form.engine_issue} onValueChange={(value) => update("engine_issue", value)} />
              <SwitchField label="Transmission issue" value={form.transmission_issue} onValueChange={(value) => update("transmission_issue", value)} />
              <View style={styles.twoColumns}>
                <View style={styles.column}><Field label="State" value={form.state} onChangeText={(value) => update("state", value)} placeholder="e.g. TX" autoCapitalize="characters" /></View>
                <View style={styles.column}><Field label="City" value={form.city} onChangeText={(value) => update("city", value)} placeholder="City" /></View>
              </View>
              <Field label="ZIP code" value={form.zip_code} onChangeText={(value) => update("zip_code", value)} keyboardType="number-pad" placeholder="ZIP code" />
              <Field label="Additional description (optional)" value={form.description} onChangeText={(value) => update("description", value)} placeholder="Other details about the vehicle" multiline />
            </Section>

            <Section title="3 · Your contact details" description="JYNM uses this information to follow up about your submission.">
              <Field label="Full name" value={form.name} onChangeText={(value) => update("name", value)} placeholder="Your name" autoComplete="name" />
              <Field label="Email" value={form.email} onChangeText={(value) => update("email", value)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Field label="Phone" value={form.phone} onChangeText={(value) => update("phone", value)} placeholder="Phone number" keyboardType="phone-pad" autoComplete="tel" />
            </Section>

            <PrimaryButton label={loading ? "Submitting…" : "Submit vehicle details"} onPress={submit} disabled={loading} loading={loading} />
            <Text style={styles.privacyNote}>Your submission is sent to JYNM over the configured API and appears in the existing admin vehicle-leads workflow. No separate mobile database is used.</Text>
            <Text style={styles.footer}>Junkyards Near Me · United States</Text>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionDescription}>{description}</Text><View style={styles.sectionFields}>{children}</View></View>;
}

function Field(props: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder?: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: "name" | "email" | "tel"; maxLength?: number; multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        accessibilityLabel={props.label}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={props.keyboardType ?? "default"}
        autoCapitalize={props.autoCapitalize ?? "words"}
        autoComplete={props.autoComplete}
        maxLength={props.maxLength}
        multiline={props.multiline}
        textAlignVertical={props.multiline ? "top" : "center"}
        style={[styles.input, props.multiline && styles.multiline]}
      />
    </View>
  );
}

function SwitchField({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#cbd5e1", true: "#93c5fd" }} thumbColor={value ? "#2563eb" : Platform.OS === "android" ? "#f8fafc" : undefined} accessibilityLabel={label} />
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false, loading = false }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <Text accessibilityRole="button" accessibilityState={{ disabled }} onPress={disabled ? undefined : onPress} style={[styles.primaryButton, disabled && styles.buttonDisabled]}>
      {loading ? <ActivityIndicator color="#ffffff" /> : label}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f7fb" },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 34, maxWidth: 720, width: "100%", alignSelf: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  brandMark: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  brand: { color: "#0f172a", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
  brandSub: { color: "#64748b", fontSize: 9, fontWeight: "800", letterSpacing: 1.6, marginTop: 2 },
  headingBlock: { marginBottom: 18 },
  eyebrow: { color: "#2563eb", fontSize: 11, fontWeight: "900", letterSpacing: 1.3, marginBottom: 8 },
  title: { color: "#0f172a", fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.5 },
  body: { color: "#64748b", fontSize: 14, lineHeight: 21, marginTop: 8 },
  healthCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderColor: "#e2e8f0", borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12, marginBottom: 16 },
  healthDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#94a3b8", marginRight: 9 },
  healthGood: { backgroundColor: "#16a34a" },
  healthBad: { backgroundColor: "#dc2626" },
  healthLabel: { flex: 1, color: "#334155", fontSize: 12, fontWeight: "700" },
  healthAction: { color: "#2563eb", fontWeight: "800", fontSize: 12, padding: 4 },
  errorBox: { backgroundColor: "#fef2f2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 14 },
  errorText: { color: "#b91c1c", fontSize: 13, lineHeight: 19, fontWeight: "600" },
  section: { backgroundColor: "#fff", borderColor: "#e2e8f0", borderWidth: 1, borderRadius: 18, padding: 17, marginBottom: 14, shadowColor: "#0f172a", shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  sectionTitle: { color: "#0f172a", fontSize: 17, fontWeight: "900" },
  sectionDescription: { color: "#64748b", fontSize: 12, lineHeight: 18, marginTop: 5 },
  sectionFields: { marginTop: 15, gap: 12 },
  twoColumns: { flexDirection: "row", gap: 10 },
  column: { flex: 1, minWidth: 0 },
  field: { gap: 6 },
  label: { color: "#334155", fontSize: 12, fontWeight: "800" },
  input: { minHeight: 48, borderWidth: 1, borderColor: "#dbe3ee", borderRadius: 11, backgroundColor: "#f8fafc", paddingHorizontal: 13, color: "#0f172a", fontSize: 14 },
  multiline: { minHeight: 90, paddingTop: 12 },
  optionRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  option: { overflow: "hidden", borderWidth: 1, borderColor: "#dbe3ee", backgroundColor: "#f8fafc", color: "#475569", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12, fontWeight: "700" },
  optionSelected: { backgroundColor: "#eff6ff", borderColor: "#2563eb", color: "#1d4ed8" },
  switchRow: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e2e8f0" },
  switchLabel: { flex: 1, color: "#334155", fontSize: 13, fontWeight: "600", paddingRight: 10 },
  primaryButton: { minHeight: 52, borderRadius: 13, backgroundColor: "#2563eb", color: "#fff", overflow: "hidden", textAlign: "center", textAlignVertical: "center", paddingHorizontal: 16, paddingVertical: 15, fontSize: 15, fontWeight: "900", marginTop: 4 },
  buttonDisabled: { backgroundColor: "#94a3b8" },
  privacyNote: { color: "#64748b", fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 13, paddingHorizontal: 8 },
  footer: { color: "#94a3b8", fontSize: 10, textAlign: "center", marginTop: 18 },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28 },
  successIcon: { width: 68, height: 68, textAlign: "center", textAlignVertical: "center", borderRadius: 34, backgroundColor: "#dcfce7", color: "#15803d", overflow: "hidden", fontSize: 37, fontWeight: "900", marginBottom: 20 },
  reference: { color: "#1d4ed8", fontSize: 15, fontWeight: "900", marginTop: 16 },
});

export default function App() {
  return <SafeAreaProvider><VehicleApp /></SafeAreaProvider>;
}
