import type { Route } from "./+types/welcome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import init, {
  eddsa_keygen,
  eddsa_sign_message,
  eddsa_verify_signature,
  ecdh_keygen,
} from "../wasm/pkg";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PeerDrop Chat" },
    {
      name: "description",
      content: "Real-time peer-to-peer chat with PeerDrop!",
    },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState("");

  const handleJoinSession = () => {
    const code = sessionCode.trim();
    if (code) {
      navigate(`/chat/${code}`);
    }
  };

  const handleCreateSession = () => {
    navigate("/chat/new");
  };

  useEffect(() => {
    init().then(() => {
      // Generate key pair
      let eddsa_keys = eddsa_keygen();
      console.log("eddsa edd", eddsa_keys);

      let signing_message = "Hello, WebAssembly!";
      let signature = eddsa_sign_message(
        signing_message,
        eddsa_keys.secret_key
      );

      console.log("eddsa signature", signature);

      let isValid = eddsa_verify_signature(
        signing_message,
        signature,
        eddsa_keys.public_key
      );
      console.log("eddsa signature valid", isValid);

      // generate ecdh keys
      let ecdh_keys = ecdh_keygen();
      console.log("ecdh keys", ecdh_keys);
    });
  }, []);

  return <div className="container mx-auto p-4">hello</div>;
}
