import { Expertise } from "./expertiseSlice";

export function filterExpertiseByBoss(expertise: Expertise, bossName: string) : Array<Expertise> {
    return Object.keys(expertise)
        .filter(key => key.startsWith(bossName))
        .map((e) => {
            return { [e]: expertise[e] };
        })
}