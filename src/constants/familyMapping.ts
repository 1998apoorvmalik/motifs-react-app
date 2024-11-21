// src/constants/familyMapping.ts

export const familyMapping = [
    { display: "eterna", value: "eterna" },
    { display: "5S", value: "5s" },
    { display: "SRP", value: "srp" },
    { display: "RNase P", value: "RNaseP" },
    { display: "tmRNA", value: "tmRNA" },
    { display: "tRNA", value: "tRNA" },
    { display: "Group I", value: "grp1" },
    { display: "16S", value: "16s" },
    { display: "23S", value: "23s" },
    { display: "User", value: "Other" },
];

// Map to retrieve display names by family value
export const familyDisplayMap = familyMapping.reduce((map, option) => {
    map[option.value] = option.display;
    return map;
}, {} as { [key: string]: string });
