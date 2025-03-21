const mockupUsers = Array.from({ length: 100 }, (_, index) => {
    const id = index + 1;
    const baseNames = [
        "Nguyen Van", "Tran Thi", "Le Van", "Pham Thi", "Hoang Van", "Nguyen Thi", "Tran Van", "Le Thi", "Pham Van", "Hoang Thi"
    ];
    const suffixes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X"];
    const roles = ["User", "Admin", "Moderator"];
    const statuses = ["active", "blocked", "inactive"];

    const baseIndex = index % baseNames.length;
    const suffixIndex = index % suffixes.length;
    const name = `${baseNames[baseIndex]} ${suffixes[suffixIndex]}`;
    const email = `${name.toLowerCase().replace(" ", "")}${id}@example.com`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];

    const startDate = new Date("2023-04-01");
    const endDate = new Date("2023-05-27");
    const randomDate = new Date(
        startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
    const lastActive = randomDate.toISOString().split("T")[0];

    return {
        id,
        name,
        email,
        status,
        role,
        lastActive,
    };
});

export default mockupUsers;