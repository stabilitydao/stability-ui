import { useStore } from "@nanostores/react";
import { vaultsData } from "../state/StabilityStore";

type Props = {
  vault?: string;
};

export default function Vault(props: Props) {
  const vault = useStore(vaultsData);
  console.log(props.vault);

  if (props.vault && vault[props.vault]) {
    return (
      <table style={{ display: "flex", justifyContent: "center" }}>
        <tbody style={{ display: "flex" }}>
          <tr
            style={{
              display: "grid",
              border: "1px",
              borderStyle: "solid",
              padding: "10px",
              borderColor: "grey",
            }}>
            <td>Vault: {props.vault}</td>
            <td>TVL: {vault[props.vault].vaultSharePrice.toString()}</td>
            <td>
              User Balance: {vault[props.vault].vaultUserBalance.toString()}
            </td>
          </tr>
        </tbody>
      </table>
    );
  } else {
    return <h1>Loading Vault..</h1>;
  }
}
