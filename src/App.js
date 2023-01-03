import { useState, useEffect } from "react";
import "./App.css";
import io from "socket.io-client";
import { Icon } from "@iconify/react";

const socket = io("http://localhost:4000");

const initialObjMessage = {
  text: "",
  img: "",
  id: "me",
};

function App() {
  const [objectMessage, setObjectMessage] = useState(initialObjMessage);
  const [historialChat, setHistorialChat] = useState([]);
  const [imageAttach, setImageAttach] = useState("");
  const [fileOver, setFileOver] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", objectMessage);
    setImageAttach("");
    setObjectMessage({ ...objectMessage, text: "" });
    if (imageAttach !== "") {
      setHistorialChat([
        ...historialChat,
        {
          text: objectMessage.text,
          img: objectMessage.img,
          id: "me",
        },
      ]);
    } else {
      setHistorialChat([
        ...historialChat,
        {
          text: objectMessage.text,
          img: null,
          id: "me",
        },
      ]);
    }
  };

  useEffect(() => {
    const reciveMessage = (message) => {
      setHistorialChat([...historialChat, message]);
    };
    socket.on("message", reciveMessage);
    localStorage.setItem("historial", JSON.stringify(historialChat));

    return () => {
      socket.off("message", reciveMessage);
    };
  }, [historialChat]);

  useEffect(() => {
    const historial = JSON.parse(localStorage.getItem("historial"));

    if (historial) {
      setHistorialChat(historialChat);
    }
  }, []);

  const BodyChat = () => {
    if (imageAttach !== "") {
      return (
        <div className="flex w-full h-[30rem] bg-slate-300 justify-center items-center relative">
          <button
            className="w-16 h-16 flex justify-center items-center absolute right-6 cursor-pointer top-3"
            onClick={() => setImageAttach("")}
          >
            <Icon
              icon="material-symbols:close"
              className="text-2xl text-gray-400"
            />
          </button>
          <img
            src={imageAttach}
            alt="image"
            className="w-4/5 h-60 object-contain"
          />
        </div>
      );
    } else if (!fileOver) {
      return (
        <div className="h-[30rem] py-4 overflow-auto">
          {historialChat.map((message, index) => {
            return (
              <div
                key={index}
                className={`px-6 py-2 rounded-xl flex flex-co ${
                  message.id === "me" && "justify-end"
                }`}
              >
                <span
                  className={`text-gray-400 bg-white px-4 py-2 rounded-lg shadow-lg  ${
                    message.id !== "me" && "bg-blue-600 text-white"
                  }`}
                >
                  {message.img && (
                    <img
                      src={message.img}
                      alt="imagen"
                      className={`w-60 h-48 object-contain bg-slate-200 rounded-lg px-4 ${
                        message.text ? "mb-2" : ""
                      }`}
                    />
                  )}
                  {message.text}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <div className="flex w-full h-[30rem] bg-slate-300 justify-center items-center">
        <h3 className="text-center font-bold px-4 text-slate-700 text-2xl mb-4">
          Suelte los elementos aquí.
        </h3>
      </div>
    );
  };

  const dragOver = (e) => {
    e.preventDefault();
    setFileOver(true);
  };

  const dragLeave = (e) => {
    e.preventDefault();
    setFileOver(false);
  };

  const drop = (e) => {
    e.preventDefault();
    setFileOver(false);
    const file = e.dataTransfer.files[0];
    const fileReader = new FileReader();

    fileReader.addEventListener("load", (e) => {
      const fileFinall = fileReader.result;
      setImageAttach(fileFinall);
    });

    fileReader.readAsDataURL(file);
  };

  useEffect(() => {
    setObjectMessage({ ...objectMessage, img: imageAttach });
  }, [imageAttach]);

  const showFile = (e) => {
    const file = document.querySelector("input[type=file]").files[0];
    const fileReader = new FileReader();

    fileReader.addEventListener("load", (e) => {
      const url = fileReader.result;
      setObjectMessage({ ...objectMessage, text: "sdfefef" });
      setImageAttach(url);
    });

    fileReader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-200">
      <h2 className="text-xl text-center text-gray-600 mb-4">
        Para provar el chat, ábra esta misma url en ontra pestaña <br />
        simulando otro usuario
      </h2>

      <div
        className="w-4/5 md:w-[40rem] border rounded-2xl shadow-2xl border-gray-300 relative"
        onDragOver={dragOver}
        onDragLeave={dragLeave}
        onDrop={drop}
      >
        <BodyChat />

        <form
          onSubmit={handleSubmit}
          className="bg-white f-full flex flex-row justify-center items-center px-2 rounded-bl-2xl h-16 w-full absolute bottom-0"
        >
          <div className="relative w-full h-full flex justify-between items-center">
            <input
              value={objectMessage.text}
              onChange={(e) =>
                setObjectMessage({ ...objectMessage, text: e.target.value })
              }
              className="w-full outline-none px-4 rounded-bl-2xl"
              placeholder="Mensaje"
              id="messageField"
              name="messageField"
            />
            <div className="px-3">
              <label
                htmlFor="dropzone-file"
                className="flex items-center justify-center cursor-pointer"
              >
                <div className="flex flex-col items-center justify-centerborder">
                  <span className="">
                    <Icon
                      icon="ant-design:paper-clip-outlined"
                      className="text-2xl text-gray-400"
                    />
                  </span>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  hidden
                  onChange={showFile}
                />
              </label>
            </div>
            <button className="">
              <span className="px-5 pr-10">
                <Icon
                  icon="material-symbols:send-outline-rounded"
                  className="text-2xl text-gray-400"
                />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
