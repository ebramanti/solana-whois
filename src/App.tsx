import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { ArrowRight } from "react-bootstrap-icons";
import { useCallback, useState } from "react";
import { resolveDomains } from "./utils/resolveDomains";

export default function App() {
  const [domains, setDomains] = useState<string>("");
  const [addresses, setAddresses] = useState<string>("");
  const [resolving, setResolving] = useState<boolean>(false);

  const onResolveDomains = useCallback(() => {
    setResolving(true);
    resolveDomains(domains)
      .then((rawAddresses) => setAddresses(rawAddresses.join("\n")))
      .finally(() => setResolving(false));
  }, [domains]);

  return (
      <Container fluid className="text-center">
        <Row style={{ paddingTop: "20px" }}>
          <h1>Solana Name Service WHOIS Lookup</h1>
          <h3>
            Paste in .sol addresses below to resolve them to their respective
            Solana address.
          </h3>
          <p>
            Shortcut: Use CMD+ENTER when the domain textarea is highlighted to
            resolve domains
          </p>
        </Row>
        <Row style={{ padding: "10px" }}>
          <Col>
            <Form.Control
              as="textarea"
              placeholder="Enter .sol domains"
              rows={20}
              value={domains}
              onChange={(event) => setDomains(event.target.value)}
              onKeyDown={(event) => {
                if (event.code === "Enter" && event.metaKey) {
                  onResolveDomains();
                }
              }}
              wrap="off"
            />
          </Col>
          <Col
            md="auto"
            style={{
              marginTop: "auto",
              marginBottom: "auto",
              paddingBottom: "50px",
            }}
          >
            <ArrowRight size={96} />
            <br />
            <Button
              variant="primary"
              onClick={onResolveDomains}
              disabled={resolving}
            >
              {resolving ? "Loading..." : "Resolve"}
            </Button>
          </Col>
          <Col>
            <Form.Control
              as="textarea"
              rows={20}
              readOnly
              value={addresses}
              wrap="off"
            />
          </Col>
        </Row>
        <footer className="fixed-bottom text-muted">
            Inspired by{" "}
            <a href="https://twitter.com/levicook/status/1469081746620784641">
              this tweet.
            </a>
          <p>
            My tip address 🙇🏻‍♂️: <code>2B3qD2ztbo8r1VSKVA4TD9PbGB7NbKVpg7JHxH28EuG2</code>
          </p>
        </footer>
      </Container>
  );
}
