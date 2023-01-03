const Index = (phone: string): boolean =>
	/(0+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/.test(phone);

export default Index;
