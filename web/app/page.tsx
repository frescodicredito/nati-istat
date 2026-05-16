import { Chapter0Opening } from "@/components/chapters/Chapter0Opening";
import { Chapter1Starting } from "@/components/chapters/Chapter1Starting";
import { Chapter2Decomposition } from "@/components/chapters/Chapter2Decomposition";
import { Chapter3TrackRecord } from "@/components/chapters/Chapter3TrackRecord";
import { Chapter4Assumptions } from "@/components/chapters/Chapter4Assumptions";
import { Chapter5Cascade } from "@/components/chapters/Chapter5Cascade";
import { Chapter6Scenarios } from "@/components/chapters/Chapter6Scenarios";

export default function Home() {
  return (
    <>
      <Chapter0Opening />
      <Chapter1Starting />
      <Chapter2Decomposition />
      <Chapter3TrackRecord />
      <Chapter4Assumptions />
      <Chapter5Cascade />
      <Chapter6Scenarios />
    </>
  );
}
