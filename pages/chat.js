import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Link from "next/link";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI5NjY2MywiZXhwIjoxOTU4ODcyNjYzfQ.fjVWvtWqXULoCZdYbzGlsitCDVZ_X_MABv0h5wJCErM';
const SUPABASE_URL = 'https://uzrnxxgeoilwtmbbwvur.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem, removeMensagem) {
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (respostaLive) => {
      console.log("ouve nova mensagem ", respostaLive);
      adicionaMensagem(respostaLive.new);
    })
    .on("DELETE", (respostaLive) => {
      removeMensagem(respostaLive.old.id);
    })
    .subscribe();
}

export default function ChatPage() {
  const [mensagem, setMessagem] = React.useState("");
  const [listaDeMensagens, setListaDeMensagens] = React.useState([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const roteamento = useRouter();
  const user = roteamento.query.username;

  // Sua lógica vai aqui
  React.useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setListaDeMensagens(data);
        setIsLoaded(true);
      });

    escutaMensagensEmTempoReal((novaMensagem) => {
      console.log(`nova msg: ${novaMensagem}`);
      setListaDeMensagens((valorAtualDaLista) => {
        return [novaMensagem, ...valorAtualDaLista];
      });
    });
  }, []);

  function handleDeleteMessage(event, mensagemID, mensagemDe) {
    event.preventDefault();
    if (user.toUpperCase() === mensagemDe.toUpperCase()) {
      supabaseClient
        .from("mensagens")
        .delete()
        .match({ id: mensagemID })
        .then(({ data }) => {
          const apagarElementoLista = listaDeMensagens.filter(
            (mensagem) => mensagem.id !== mensagemID
          );
          setListaDeMensagens(apagarElementoLista);
        });
    } else {
      window.alert("Impossível deletar mensagem de outros usuários!");
    }
  }

  function handleNovaMensage(novaMensagem) {
    const mensagem = {
      // id: listaDeMensagens.length + 1,
      de: user,
      texto: novaMensagem,
    };

    if (user === "") {
      return window.alert("Espere! Insira depois da mensagem!");
    }
    if (novaMensagem.length > 0) {
      supabaseClient
        .from("mensagens")
        .insert([mensagem])
        .then(({ data }) => {
          // console.log("Criando mensagem: ", data);
          // setListaDeMensagens([data[0], ...listaDeMensagens]);
        });
      setMessagem("");
    } else {
      window.alert("Impossível de enviar mensagem vazia !");
    }
  }

  if (!isLoaded) {
    return (
        <>
        <style global jsx>{`
            .loading-image {
                max-width: 200px;
                max-height: 200px;
                animation: rotation .5s linear infinite; 
            }
            @keyframes rotation {
                to {
                    transform: rotate(360deg);
                }
            }
        `}</style>

        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backgroundImage: 'url(https://cdn.pixabay.com/photo/2019/09/29/22/06/light-bulb-4514505_1280.jpg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover', 
                 backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
           <img src="vela.gif" className='loading-image' />
        </Box>
    </>
    );
  }

  if (isLoaded) {
    return (
           
      <Box
      
        styleSheet={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backgroundImage: 'url(https://cdn.pixabay.com/photo/2019/09/29/22/06/light-bulb-4514505_1280.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover', 
             backgroundBlendMode: 'multiply',
            color: appConfig.theme.colors.neutrals['000']
        }}
      >

        <Box
          styleSheet={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
            borderRadius: "5px",
            backgroundColor: appConfig.theme.colors.primary["000"],
            height: "100%",
            width: "100%",
            maxWidth: "100%",
            maxHeight: "95vh",
            padding: "32px",
          }}
        >
          <Header username={user} />
          <Box
            styleSheet={{
              position: "relative",
              display: "flex",
              flex: 1,
              height: "80%",
              backgroundColor: appConfig.theme.colors.neutrals["000"],
              flexDirection: "column",
              borderRadius: "5px",
              padding: "16px",
            }}
          >
            <MessageList
              mensagem={listaDeMensagens}
              onDelete={handleDeleteMessage}
              currentUser={user}
            />
            <Box
              as="form"
              styleSheet={{
                display: "flex",
                alignItems: "stretch",
              }}
            >
              <TextField
                value={mensagem}
                onChange={(event) => {
                  const valor = event.target.value;
                  setMessagem(valor);
                }}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleNovaMensage(mensagem);
                  }
                }}
                placeholder="Insira sua mensagem aqui..."
                type="textarea"
                styleSheet={{
                  width: "100%",
                  border: "0",
                  resize: "none",
                  borderRadius: "5px",
                  padding: "6px 8px",
                  backgroundColor: appConfig.theme.colors.neutrals[800],
                  marginRight: "12px",
                  color: appConfig.theme.colors.neutrals[200],
                  hover: {
                    backgroundColor: appConfig.theme.colors.neutrals[900],
                  },
                }}
              />
              {/* CALLBACK -> Chamada de retorno */}
              <ButtonSendSticker
                onStickerClick={(sticker) => {
                  // console.log("[USANDO] Salva esse sticker no banco");
                  handleNovaMensage(":sticker:" + sticker);
                }}
              />
              <Button
                type="submit"
                onClick={(event) => {
                  event.preventDefault();
                  handleNovaMensage(mensagem);
                }}
                label={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-send"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                }
                styleSheet={{
                  backgroundColor: "rgba(0,0,0,0)",
                  color: appConfig.theme.colors.neutrals[100],
                  transition: "0.5s",
                  marginBottom: "6px",
                  hover: {
                    backgroundColor: appConfig.theme.colors.neutrals[900],
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
}

function Header(props) {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Paparicando, {props.username}</Text>
        <Button
          variant="tertiary"
          colorVariant="light"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  // const [showInfo, setShowInfo] = React.useState("");
  // const today = new Date();
  const currentUser = props.currentUser;

  return (
    <Box
      tag="ul"
      styleSheet={{
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        position: "relative",
        color: appConfig.theme.colors.neutrals["200"],
        marginBottom: "16px",
        width: "100%",
      }}
    >
      {props.mensagem.map((mensagem) => {
        let marginLeftDesk = "0";
        let marginLeftMobile = "0";
        let currentUserMessageBg = appConfig.theme.colors.primary[800];
        currentUser.toUpperCase() === mensagem.de.toUpperCase()
          ? ((marginLeftDesk = "14%"),
            (marginLeftMobile = "10%"),
            (currentUserMessageBg = appConfig.theme.colors.primary[600]))
          : false;
        const search = "-";
        const replaceWith = "/";
        const date = mensagem.created_at
          .slice(0, mensagem.created_at.indexOf("T"))
          .split(search)
          .join(replaceWith);
        const hour = mensagem.created_at.slice(
          mensagem.created_at.indexOf("T") + 1,
          mensagem.created_at.indexOf("T") + 6
        );
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              backgroundColor: currentUserMessageBg,
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              marginLeft: {
                xs: "5px",
                sm: "7px",
              },
              padding: "6px",
              marginBottom: "12px",
              wordBreak: "break-word",
              width: {
                xs: "90%",
                md: "85%",
              },
              marginLeft: {
                xs: marginLeftMobile,
                md: marginLeftDesk,
              },
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                display: "flex",
                flexWrap: "wrap",
                margin: "0.25rem 0",
              }}
            >
              <Link
                href={`https://github.com/${mensagem.de}`}
                styleSheet={{
                  cursor: "pointer",
                }}
              >
                <Text
                  styleSheet={{
                    fontWeight: "bolder",
                    fontSize: "1em",
                    minWidth: "70px",
                    width: "10%",
                    hover: {
                      cursor: "pointer",
                    },
                  }}
                ></Text>
              </Link>

              <Text
                styleSheet={{
                  fontWeight: "normal",
                  fontSize: "0.85em",
                  minWidth: "100px",
                  width: "10%",
                }}
              ></Text>
              <Text
                styleSheet={{
                  fontWeight: "normal",
                  fontSize: "0.85em",
                  minWidth: "100px",
                  width: "10%",
                }}
              ></Text>
            </Box>
            <Box
              styleSheet={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                minHeight: "90px",
              }}
            >
              <Box
                styleSheet={{
                  alignItems: {
                    xs: "flex-start",
                    md: "center",
                  },
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0 0.5rem",
                  width: { xs: "80%" },
                  maxWidth: "300px",
                }}
              >
                <Link href={`https://github.com/${mensagem.de}`}>
                  <Image
                    title={`Open ${mensagem.de} GitHub`}
                    styleSheet={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "8px",
                      marginLeft: {
                        xs: "5px",
                        sm: "7px",
                      },
                      hover: {
                        cursor: "pointer",
                        width: "35px",
                        height: "35px",
                      },
                    }}
                    src={`https://github.com/${mensagem.de}.png`}
                  />
                </Link>
                <Text
                  styleSheet={{
                    marginLeft: {
                      xs: "5px",
                      sm: "7px",
                    },
                  }}
                  tag="strong"
                >
                  {mensagem.de}
                </Text>
                <Text
                  styleSheet={{
                    fontSize: "12px",
                    marginLeft: {
                      xs: "5px",
                      sm: "7px",
                    },
                    color: appConfig.theme.colors.neutrals[300],
                  }}
                  tag="span"
                >
                  {`${date}`}
                </Text>
                <Text
                  onClick={async (event) => {
                    const res = await fetch(
                      `https://api.github.com/users/${mensagem.de}`
                    );
                    const userInfos = await res.json();
                    console.log(userInfos);
                    let moreInfo =
                      event.target.parentNode.parentNode.parentNode.firstChild;
                    let gitHubLink = moreInfo.childNodes[0];
                    let gitHubRepos = moreInfo.childNodes[1];
                    let gitHubFollowers = moreInfo.childNodes[2];
                    event.target.innerText === "show"
                      ? ((event.target.innerText = "hide"),
                        (gitHubLink.innerText = "+GitHub"),
                        (gitHubRepos.innerText = `Repos: ${userInfos.public_repos}`),
                        (gitHubFollowers.innerText = `Followers: ${userInfos.followers}`))
                      : ((event.target.innerText = "show"),
                        (gitHubLink.innerText = ""),
                        (gitHubRepos.innerText = ""),
                        (gitHubFollowers.innerText = ``));
                  }}
                  styleSheet={{
                    fontWeight: "bold",
                    fontSize: "0.9em",
                    marginLeft: {
                      xs: "0",
                      sm: "25px",
                    },
                    color: appConfig.theme.colors.neutrals[0],
                    hover: {
                      cursor: "pointer",
                      color: appConfig.theme.colors.neutrals[400],
                    },
                  }}
                  title={`Open ${mensagem.de} GitHub`}
                  tag="span"
                >
                  show
                </Text>
              </Box>
              <Box>
                <Button
                  key={mensagem.id}
                  type="submit"
                  onClick={(event) => {
                    return props.onDelete(event, mensagem.id, mensagem.de);
                  }}
                  title={`Apagar mensagem`}
                  styleSheet={{
                    borderRadius: "100px",
                    color: appConfig.theme.colors.neutrals[100],
                    fontSize: "1em",
                    fontWeight: "bold",
                    transition: "0.5s",
                  }}
                  buttonColors={{
                    contrastColor: "#FDFDFD",
                    mainColor: "rgba(0, 0, 0, 0.0)",
                    mainColorStrong: "rgba(255, 107, 107, .35)",
                  }}
                  colorVariant="negative"
                  iconName="FaRegTrashAlt"
                />
              </Box>
            </Box>
            <Box
              styleSheet={{
                alignItems: "flex-end",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {mensagem.texto.startsWith(":sticker:") ? (
                <Image
                  styleSheet={{
                    width: "50%",
                    maxWidth: "120px",
                  }}
                  src={mensagem.texto.replace(":sticker:", "")}
                />
              ) : (
                mensagem.texto
              )}

              <Text
                styleSheet={{
                  textAlign: "right",
                  fontSize: "10px",
                  marginLeft: "13px",
                  width: "22%",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {hour}
              </Text>
            </Box>
          </Text>
        );
      })}
    </Box>
  );
}
