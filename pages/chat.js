import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANONKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4NTMzMywiZXhwIjoxOTU4ODYxMzMzfQ.-NtLxOG1vkn06eLyN25EPZnymDnJ0_x6ZSFPdh9X4R4';
const SUBASE_URL = 'https://rqlwuzbgspxsernirxej.supabase.co';
const supabaseClient = createClient(SUBASE_URL,SUPABASE_ANONKEY );

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe();
  }


export default function ChatPage() {

    const roteamento = useRouter();
    const usurarioLogado = roteamento.query.username;
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([ ]);

        React.useEffect(() => {
            supabaseClient
            .from ('mensagens')
            .select('*')
            .order('id', {ascending: false})
            .then(({data}) => {
                 setListaDeMensagens(data)
            }) ;

            const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
                console.log('Nova mensagem:', novaMensagem);
                console.log('listaDeMensagens:', listaDeMensagens);
            
                setListaDeMensagens((valorAtualDaLista) => {

                  return [
                   novaMensagem,
                    ...valorAtualDaLista,
                  ]
                });
              });
          
              return () => {
                subscription.unsubscribe();
              }
        }, []);


    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            // id: listaDeMensagens.length,
            de: usurarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then(({data}) => {
              
            });

        setMensagem('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://images8.alphacoders.com/103/thumb-1920-1034547.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[999
                    ],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[999],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    {/* <MessageList mensagens={[]} /> */}
                    <MessageList mensagens = {listaDeMensagens} setMensagens={setListaDeMensagens} />
                    {/* {listaDeMensagens.map((mensagemAtual) => {
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.remetente} : {mensagemAtual.texto}
                            </li>
                        )
                    })} */}

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(e) => {
                                const valor = e.target.value;
                                setMensagem(valor);
                            }}
                            onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        < ButtonSendSticker 
                        onStickerClick = {(sticker) => {
                            console.log('Salvar esse foda', sticker)
// opção diferente de fazer: handleNovaMensagem (':sticker:' + sticker)
                            handleNovaMensagem(`:sticker:${sticker}`)
                        }}
                        />

                        <Button 
                            type='submit'
                            label='Enviar'
                            variant='tertiary'
                            colorVariant='neutral'
                            onClick={(e) => {
                                e.preventDefault();
                                handleNovaMensagem(mensagem);
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    function Remover(mensagem) {
        const novaListaDeMensagens = props.mensagens.filter((mensagemRemover) =>{
            return mensagem.id !== mensagemRemover.id
        })
        props.setMensagens(novaListaDeMensagens)
    }

    return (
        <Box
            tag="ul"
            styleSheet={{
                
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            marginLeft: "5px",
                           borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            // background das mensagens
                           // hover: {
                               // backgroundColor: appConfig.theme.colors.neutrals[500],
                            //}
                        }}
                    >
                        <Box
                            styleSheet={{
                                
                                display: 'flex',
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                //src={`https://github.com/brunowilian.png`}
                               src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong"
                                styleSheet={{
                                    marginLeft: "5px",
                                    fontSize: '20px'
                                }}
                                >
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    
                                   fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                                <Button 
                                    label='Excluir'
                                  //  type='button'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        Remover(mensagem);
                                    }}
                                    styleSheet={{
                                        
                                        height: '15px',
                                        width: '48px',
                                        marginLeft: '15px',
                                        
                                        hover: {
                                            backgroundColor: appConfig.theme.colors.neutrals[999],
                                        }
                                    }}
                                /> 
                        </Box>
                        {mensagem.texto.startsWith(':sticker:')
              ? (
                <Image src={mensagem.texto.replace(':sticker:', '')}
                
                styleSheet={{
                    marginLeft: "50px",
                   // height: '30%',
                    
                }} />
              )
              : 
              (
                      mensagem.texto   
              )}               
                  </Text>
                )
            })}
        </Box>
    )
}