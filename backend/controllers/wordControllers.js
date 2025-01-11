import { generate } from "random-words";

const wordLengthHandle = (req, res) => {
    try {
        var { time, isMulti } = req.body;
        if (!isMulti) {
            if (!time) return res.status(401).send({ message: "Please Provide Time" });
            // Changing Time In Seconds time in minutes
            time /= 60;
            const words = generate({ exactly: (time * 600) + 300, join: " " });
            res.status(201).send({ words });
        }
        else {
            if (!time) return res.status(401).send({ message: "Please Provide Time" });
            // Changing Time In Seconds time in minutes
            time /= 60;
            const words = generate({ exactly: Math.round((100 * time)), join: " " });
            res.status(201).send({ words });
        }
    } catch (err) {
        res.status(401).send({ message: err });
    }
}

export { wordLengthHandle }