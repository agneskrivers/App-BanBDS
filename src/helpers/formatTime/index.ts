// Function Type
type HelperFormatTime = (time: number) => string;

const Index: HelperFormatTime = time => time.toString().padStart(2, '0');

export default Index;
