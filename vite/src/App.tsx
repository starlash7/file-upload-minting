import { Button, Flex, Text } from "@chakra-ui/react";
import { Contract, ethers } from "ethers";
import { JsonRpcSigner } from "ethers";
import { ChangeEvent, FC, useEffect, useState } from "react";
import mintNftAbi from "./mintNftAbi.json";
import axios from "axios";

const App: FC = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const onClickMetamask = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);

      setSigner(await provider.getSigner());
    } catch (error) {
      console.error(error);
    }
  };

  const uploadImage = async (formData: FormData) => {
    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: import.meta.env.VITE_PINATA_KEY,
            pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET,
          },
        }
      );

      return `https://slime-project.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.currentTarget.files) return;

      const formData = new FormData();

      formData.append("file", e.currentTarget.files[0]);

      const imageUrl = await uploadImage(formData);

      console.log(imageUrl);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!signer) return;

    setContract(
      new Contract(
        "0xe740e9faF4de70C9680F6224eae69c21a7BA5E43",
        mintNftAbi,
        signer
      )
    );
  }, [signer]);

  return (
    <Flex
      bgColor="red.100"
      w="100%"
      minH="100vh"
      justifyContent="center"
      alignItems="center"
      flexDir="column"
    >
      {signer ? (
        <>
          <Text>{signer.address}</Text>
          <input type="file" onChange={onChangeFile} />
        </>
      ) : (
        <Button onClick={onClickMetamask}>🦊 로그인</Button>
      )}
    </Flex>
  );
};

export default App;
