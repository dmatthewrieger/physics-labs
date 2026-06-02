import { useMemo, useState } from "react";
import { labs } from "./data/labs";
import { LabDetails } from "./components/LabDetails";
import { LabLibrary } from "./components/LabLibrary";
import { ModeSelector } from "./components/ModeSelector";
import { CourseMode } from "./types/labTypes";
import { NewtonsLawsLab } from "./labs/newtons-laws/NewtonsLawsLab";
import { OneDimensionalKinematicsLab } from "./labs/one-dimensional-kinematics/OneDimensionalKinematicsLab";

type Screen = "library" | "details" | "mode" | "lab";

export default function App() {
  const [screen, setScreen] = useState<Screen>("library");
  const [selectedLabId, setSelectedLabId] = useState("newtons-laws");
  const [mode, setMode] = useState<CourseMode>("algebra-trig");

  const selectedLab = useMemo(
    () => labs.find((lab) => lab.id === selectedLabId) ?? labs[0],
    [selectedLabId],
  );

  const openLab = (labId: string) => {
    setSelectedLabId(labId);
    setScreen("details");
  };

  if (screen === "library") {
    return <LabLibrary onSelectLab={openLab} />;
  }

  if (screen === "details") {
    return <LabDetails lab={selectedLab} onBack={() => setScreen("library")} onChooseMode={() => setScreen("mode")} />;
  }

  if (screen === "mode") {
    return (
      <ModeSelector
        onBack={() => setScreen("details")}
        onSelectMode={(nextMode) => {
          setMode(nextMode);
          setScreen("lab");
        }}
      />
    );
  }

  if (selectedLabId === "one-dimensional-kinematics") {
    return (
      <OneDimensionalKinematicsLab
        mode={mode}
        onBackToLibrary={() => setScreen("library")}
        onChangeMode={() => setScreen("mode")}
      />
    );
  }

  return (
    <NewtonsLawsLab
      mode={mode}
      onBackToLibrary={() => setScreen("library")}
      onChangeMode={() => setScreen("mode")}
    />
  );
}
