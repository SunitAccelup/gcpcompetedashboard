import React, {
  useState,
  useEffect,
} from "react";
import { Auth, Hub } from "aws-amplify";
import Amplify from "aws-amplify";
import config from "./aws-exports.js";

import {
  Alert,
  Button,
  Heading,
  ToggleButton,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  ThemeProvider,
  Theme,
  SelectField,
  useTheme,
} from "@aws-amplify/ui-react";
import { AiTwotoneDelete } from "react-icons/ai";
import TextareaAutosize from "react-textarea-autosize";
import "@aws-amplify/ui-react/styles.css";

import Page from "./Page";

Amplify.configure(config);

function App() {
  // User variable for midway authentication
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // For midway authentication: use effect
  useEffect(() => {
    Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          console.log(event);
          console.log(data);
          getUser().then((userData) => setUser(userData));
          // Getting the user token
          console.log(data.signInUserSession.accessToken.jwtToken)
          setToken(data.signInUserSession.accessToken.jwtToken)
          break;
        case "signOut":
          setUser(null);
          break;
        case "signIn_failure":
          console.log("Sign in failure", data);
          break;
      }
    });
    getUser().then((userData) => setUser(userData));
  // Get bearer token when adding, editid, gobjs, or f are changed
  }, [adding, editid, gobjs]);
  // For midway authentication: Get user
  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then((userData) => userData)
      .catch(() => console.log("Not signed in!!!"));
  }

  // For form
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState("");
  const [claim, setClaim] = useState("");
  const [winloss, setWinloss] = useState("");
  const [priority, setPriority] = useState("");
  const [serviceteam, setServiceteam] = useState("");
  const [use, setUse] = useState("");

  // Styling for the signin and out button
  const { tokens } = useTheme();

  // Table Theme
  const theme: Theme = {
    name: "table-theme",
    tokens: {
      components: {
        table: {
          row: {
            hover: {
              backgroundColor: { value: "{colors.blue.20}" },
            },
            striped: {
              backgroundColor: { value: "{colors.blue.10}" },
            },
          },
          header: {
            color: { value: "{colors.blue.80}" },
            fontSize: { value: "{fontSizes.xl}" },
          },
          data: {
              fontWeight: { value: "{fontWeights.semibold}" },
              style: { value: "{textAlign.left}"},
          },
        },
      },
    },
  };



// UseEffect for the token and getting objects
  useEffect(() => {
    async function fetc() {
      // Get the user data for the access token first
      var temp = null;
      Auth.currentAuthenticatedUser().then((userData) => 
      {
        temp = userData;
        // var auth = 'Bearer ' + token;
        var auth = 'Bearer ' + temp.signInUserSession.accessToken.jwtToken;
        fetchGobjs(auth);
        async function fetchGobjs(auth) {
          const headers = {
            "Content-Type": "application/json",
            "Authorization": auth
          };
          const apiResponse = await fetch(
            "https://5bph06mfz9.execute-api.us-west-2.amazonaws.com/test/read",
            { headers }
          );
          const apiResponseJSON = await apiResponse.json();
          const gs = apiResponseJSON.body;
          console.log(gs);
          setGobjs([...gs]);
        }
      });
    }
    fetc();
  }, []);


  // For Gobjs
  const [gobjs, setGobjs] = useState([]);

  // Fetch the gobjs in the table
  async function fetchGobjs() {
    var temp = null;
    Auth.currentAuthenticatedUser().then((userData) => 
    {
      temp = userData;
      // var auth = 'Bearer ' + token;
      var auth = 'Bearer ' + temp.signInUserSession.accessToken.jwtToken;
      fetchGobjs(auth);
      async function fetchGobjs(auth) {
        const headers = {
          "Content-Type": "application/json",
          "Authorization": auth
        };
        const apiResponse = await fetch(
          "https://5bph06mfz9.execute-api.us-west-2.amazonaws.com/test/read",
          { headers }
        );
        const apiResponseJSON = await apiResponse.json();
        const gs = apiResponseJSON.body;
        console.log(gs);
        setGobjs([...gs]);
      }
    });
  }
  // UseEffect to fetch the gobjs in the table
  useEffect(() => {
    fetchGobjs();
  }, []);


  // Create gobj
  async function createGobj() {
    var temp = null;
    Auth.currentAuthenticatedUser().then((userData) => 
    {
      temp = userData;
      // var auth = 'Bearer ' + token;
      var auth = 'Bearer ' + temp.signInUserSession.accessToken.jwtToken;
      console.log(auth);
      // Stringify the JSON data
      var raw = JSON.stringify({
        customer: customer,
        service: service,
        claim: claim,
        winloss: winloss,
        priority: priority,
        serviceteam: serviceteam,
        user: user.username,
        // user: 'amazonfederate_hugotp'
      });
      console.log(raw);
      createGobjs(auth, raw);
      // Function for creating the object
      async function createGobjs(auth, raw) {
        // instantiate a headers object
        var myHeaders = new Headers();
        // add content type header to object
        myHeaders.append("Content-Type", "application/json");
        // Adding authorization token to header
        myHeaders.append("Authorization", auth);
        // create a JSON object with parameters for API call and store in a variable
        var requestOptions = {
          method: "PUT",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        // Make the API Call
        const apiResponse = await fetch(
          "https://5bph06mfz9.execute-api.us-west-2.amazonaws.com/test/create",
          requestOptions
        ).then((response) => response.text())
        .catch((error) => console.log("error", error));
        // Reset all variables
        setCustomer("");
        setService("");
        setClaim("");
        setWinloss("");
        setPriority("");
        setServiceteam("");
        // Fetch the objects again
        fetchGobjs();
        // Change adding
        setAdding(!adding);
        // For pagination
        setCurrentPage(Math.ceil((gobjs.length + 1) / postsPerPage));;
      }
    });
  }



  // Delete gobj
  async function deleteGobj({ gobj }) {
    // Log the object id
    console.log(gobj.id);
    var temp = null;
    Auth.currentAuthenticatedUser().then((userData) => 
    {
      temp = userData;
      // var auth = 'Bearer ' + token;
      var auth = 'Bearer ' + temp.signInUserSession.accessToken.jwtToken;
      // Body
      var raw = JSON.stringify({ id: gobj.id });
      console.log(auth);
      // Pass auth and raw into deleteGobj
      deleteGobj(auth, raw);
      // Function for deleting the object
      async function deleteGobj(auth, raw) {
        // instantiate a headers object
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        // Adding authorization token to header
        myHeaders.append("Authorization", auth);
        // create a JSON object with parameters for API call and store in a variable
        var requestOptions = {
          method: "PUT",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };
        // make API call with parameters and use promises to get response
        await fetch(
          "https://5bph06mfz9.execute-api.us-west-2.amazonaws.com/test/delete",
          requestOptions
        ).then((response) => response.text())
        .catch((error) => console.log("error", error));
        // Fetch the objects again
        fetchGobjs();
      }
    });
  }



  // Editing gobj
  async function editGobj() {
    console.log(editid);
    var temp = null;
    Auth.currentAuthenticatedUser().then((userData) => 
    {
      temp = userData;
      // var auth = 'Bearer ' + token;
      var auth = 'Bearer ' + temp.signInUserSession.accessToken.jwtToken;
      // instantiate a headers object
      var myHeaders = new Headers();
      // var auth = 'Bearer ' + token;
      var auth = 'Bearer ' + user.signInUserSession.accessToken.jwtToken;
      // Log the access key
      console.log(auth); 
      // add content type header to object
      myHeaders.append("Content-Type", "application/json");
      // Adding authorization token
      myHeaders.append("Authorization", auth);
      // Customer
      if (customer != "") {
        console.log("Customer variable not empty");
        var rawCustomer = JSON.stringify({ id: editid, customer: customer });
        var requestOptionsCustomer = {
          method: "PUT",
          headers: myHeaders,
          body: rawCustomer,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsCustomer, 'customer');
      }
      // Service
      if (service != "") {
        console.log("Service variable not empty");
        var rawService = JSON.stringify({ id: editid, service: service });
        var requestOptionsService = {
          method: "PUT",
          headers: myHeaders,
          body: rawService,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsService, 'service');
      }
      // Claim
      if (claim != "") {
        console.log("Claim variable not empty");
        var rawClaim = JSON.stringify({ id: editid, claim: claim });
        var requestOptionsClaim = {
          method: "PUT",
          headers: myHeaders,
          body: rawClaim,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsClaim, 'claim');
      }
      // Winloss
      if (winloss != "") {
        console.log("Winloss variable not empty");
        var rawWinloss = JSON.stringify({ id: editid, winloss: winloss });
        var requestOptionsWinloss = {
          method: "PUT",
          headers: myHeaders,
          body: rawWinloss,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsWinloss, 'winloss');
      }
      // Priority
      if (priority != "") {
        console.log("Priority variable not empty");
        var rawPriority = JSON.stringify({ id: editid, priority: priority });
        var requestOptionsPriority = {
          method: "PUT",
          headers: myHeaders,
          body: rawPriority,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsPriority, 'priority');
      }
      // Service Team
      if (serviceteam != "") {
        console.log("Serviceteam variable not empty");
        var rawServiceteam = JSON.stringify({ id: editid, serviceteam: serviceteam });
        var requestOptionsServiceteam = {
          method: "PUT",
          headers: myHeaders,
          body: rawServiceteam,
          redirect: "follow",
        };
        // Pass auth and requestionOptions into editGobj
        editGobj(requestOptionsServiceteam, 'serviceteam');
      }
      // Function for deleting the object
      async function editGobj(request, clearVar) {
        // make API call with parameters and use promises to get response
        await fetch(
        "https://5bph06mfz9.execute-api.us-west-2.amazonaws.com/test/edit",
        request
        ).then((response) => response.text())
        .catch((error) => console.log("error", error));
        // Clear all variables
        if (clearVar == 'customer'){
          setCustomer("");
        }
        if (clearVar == 'service'){
          setService("");
        }
        if (clearVar == 'claim'){
          setClaim("");
        }
        if (clearVar == 'winloss'){
          setWinloss("");
        }
        if (clearVar == 'priority'){
          setPriority("");
        }
        if (clearVar == 'serviceteam'){
          setServiceteam("");
        }
        // Fetch the objects and clear adding/edit
        fetchGobjs();
        clear();
      }
    });
  }

  

  // Adding
  const [adding, setAdding] = useState(false);
  // Change adding
  async function changeAdding() {
    if (adding == false) {
      if (editid != "") {
        setEditid("");
      }
    }
    // Set the adding variable
    setAdding(!adding);
  }

  // Editing
  const [editid, setEditid] = useState("");
  // Use effect for editing
  useEffect(() => {
    setEditid(editid);
    console.log("useEffect Edit ID = " + editid);
  }, [editid]);
  // Set the edit id
  async function change({ gobj }) {
    const x = gobj.id;
    setEditid(x);
    if (adding) {
      setAdding(false);
    }
    fetchGobjs();
  }

  // Clearing adding and editid
  async function clear() {
    setAdding(false);
    setEditid("");
  }

  // Controlling who can edit and delete
  // async function showUser() {
  //   console.log(user);
  // }

  // Pagination (only runs when it mounts)
  const [posts, setPosts] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  // Pagination, change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // console.log(posts);
  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  // const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  // const currentGobjs = gobjs.slice(indexOfFirstPost, indexOfLastPost);
  const [currentGobjs, setCurrentgobjs] = useState([]);
  // Pagination Use Effects
  useEffect(() => {
    setCurrentgobjs(gobjs.slice(indexOfFirstPost, indexOfLastPost));
  }, [gobjs, indexOfFirstPost, indexOfLastPost]);
  // Pagination Use Effects
  useEffect(() => {
    setCurrentPage(currentPage);
  }, [gobjs, currentPage]);


  return (
    <div className="App">
      {/* Production Change */}
      {user ? (
        <>
          <div className="signInAndOutDiv">
            {/* Sign out button */}
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() => Auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
                  <Heading level={1}>AWS vs GCP Services Comparison (Customer Feedback)</Heading>

          {/* Pagination Component */}
          {/* <Page postsPerPage={postsPerPage} totalPosts={posts.length} paginate={paginate} gobjs={gobjs}></Page> */}
          {gobjs.length > 0 ? (
            <>
              <p>
                Showing {indexOfFirstPost + 1} to{" "}
                {indexOfLastPost > gobjs.length
                  ? gobjs.length
                  : indexOfLastPost}{" "}
                of {gobjs.length} rows
              </p>
              <Page
                postsPerPage={postsPerPage}
                totalPosts={gobjs.length}
                paginate={paginate}
                gobjs={gobjs}
              ></Page>
            </>
          ) : (
            <></>
          )}

          <div className="tableDiv">
            <ThemeProvider theme={theme} colorMode="light">
              <Table highlightOnHover variation="striped">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>SA</b>
                    </TableCell>
                    <TableCell className="theadCell">
                      <b>
                          Customer
                      </b>
                    </TableCell>
                    <TableCell>
                      <b>Service</b>
                    </TableCell>
                    <TableCell>
                      <b>GCP Claim / Customer Feedback</b>
                    </TableCell>
                    <TableCell>
                      <b>
                        Win / Loss to GCP? Key factor resulting in loss and
                        learnings
                      </b>
                    </TableCell>
                    <TableCell>
                      <b>Priority / AWS GCP Compete Team Response</b>
                    </TableCell>
                    <TableCell>
                      <b>Service Team PFR / Roadmap</b>
                    </TableCell>
                    <TableCell>
                      <ToggleButton onClick={() => changeAdding()}>
                        {adding ? <>HIDE</> : <>ADD </>}
                      </ToggleButton>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {adding ? (
                    <>
                      <TableRow>
                        {/* User */}
                        <TableCell>
                          {/* Production */}
                          {user.username.slice(15)}
                          {/* testUser */}
                        </TableCell>
                        <TableCell>
                          {/* Customer */}
                          <TextareaAutosize
                            className="responsiveTA"
                            // defaultValue={}
                            placeholder="Type here..."
                            onChange={(e) => setCustomer(e.target.value)}
                            value={customer}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Service */}
                          <TextareaAutosize
                            className="responsiveTA"
                            // defaultValue={}
                            placeholder="Type here..."
                            onChange={(e) => setService(e.target.value)}
                            value={service}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Claim */}
                          <TextareaAutosize
                            className="responsiveTA"
                            // defaultValue={}
                            placeholder="Type here..."
                            onChange={(e) => setClaim(e.target.value)}
                            value={claim}
                          />
                        </TableCell>
                        <TableCell>
                          {/* Win/Loss */}
                          <TextareaAutosize
                            className="responsiveTA"
                            // defaultValue={}
                            placeholder="Type here..."
                            onChange={(e) => setWinloss(e.target.value)}
                            value={winloss}
                          />
                        </TableCell>
                        <TableCell>
                          <SelectField
                            placeholder="Select"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                          >
                            <option
                              value="Priority: High"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              High
                            </option>
                            <option
                              value="Priority: Medium"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Medium
                            </option>
                            <option
                              value="Priority: Low"
                              fontSize="var(--amplify-font-sizes-small)"
                            >
                              Low
                            </option>
                          </SelectField>
                        </TableCell>
                        <TableCell>
                          {/* Service Team */}
                          <TextareaAutosize
                            className="responsiveTA"
                            // defaultValue={}
                            placeholder="Type here..."
                            onChange={(e) => setServiceteam(e.target.value)}
                            value={serviceteam}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Button
                              loadingText=""
                              onClick={() => createGobj()}
                              ariaLabel=""
                              className="submitAndCancel"
                            >
                              Submit
                            </Button>
                          </div>
                          <div>
                            <Button
                              loadingText=""
                              onClick={() => clear()}
                              ariaLabel=""
                              className="submitAndCancel"
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <></>
                  )}

                  {/* Mapping the gobjs */}
                  {gobjs.length > 0 ? (
                    currentGobjs.map((gobj) => (
                      <>
                        {gobj.id == editid ? (
                          <>
                            {/* Row for editing */}
                            <TableRow>
                              {/* User */}
                              <TableCell>
                                {gobj.user.slice(15)}
                                <br />
                                <br />
                              </TableCell>
                              <TableCell>
                                {/* Customer */}
                                <TextareaAutosize
                                  className="responsiveTA"
                                  // defaultValue={}
                                  placeholder="..."
                                  onChange={(e) => setCustomer(e.target.value)}
                                  defaultValue={gobj.customer}
                                />
                              </TableCell>
                              <TableCell>
                                {/* Service */}
                                <TextareaAutosize
                                  className="responsiveTA"
                                  // defaultValue={}
                                  placeholder="..."
                                  onChange={(e) => setService(e.target.value)}
                                  defaultValue={gobj.service}
                                />
                              </TableCell>
                              <TableCell>
                                {/* Claim */}
                                <TextareaAutosize
                                  className="responsiveTA"
                                  // defaultValue={}
                                  placeholder="..."
                                  onChange={(e) => setClaim(e.target.value)}
                                  defaultValue={gobj.claim}
                                />
                              </TableCell>
                              <TableCell>
                                {/* Win/Loss */}
                                <TextareaAutosize
                                  className="responsiveTA"
                                  // defaultValue={}
                                  placeholder="..."
                                  onChange={(e) => setWinloss(e.target.value)}
                                  defaultValue={gobj.winloss}
                                />
                              </TableCell>
                              <TableCell>
                                <SelectField
                                  placeholder="Select"
                                  value={priority}
                                  onChange={(e) => setPriority(e.target.value)}
                                >
                                  <option
                                    value="Priority: High"
                                    fontSize="var(--amplify-font-sizes-small)"
                                  >
                                    High
                                  </option>
                                  <option
                                    value="Priority: Medium"
                                    fontSize="var(--amplify-font-sizes-small)"
                                  >
                                    Medium
                                  </option>
                                  <option
                                    value="Priority: Low"
                                    fontSize="var(--amplify-font-sizes-small)"
                                  >
                                    Low
                                  </option>
                                </SelectField>
                              </TableCell>
                              <TableCell>
                                {/* Service Team */}
                                <TextareaAutosize
                                  className="responsiveTA"
                                  // defaultValue={}
                                  placeholder="..."
                                  onChange={(e) =>
                                    setServiceteam(e.target.value)
                                  }
                                  defaultValue={gobj.serviceteam}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <Button
                                    loadingText=""
                                    onClick={() => editGobj({ gobj })}
                                    ariaLabel=""
                                    className="submitAndCancel"
                                  >
                                    Submit
                                  </Button>
                                </div>
                                <div>
                                  <Button
                                    loadingText=""
                                    onClick={() => clear()}
                                    ariaLabel=""
                                    className="submitAndCancel"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </>
                        ) : (
                          <>
                            <TableRow key={gobj.id}>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                <a
                                  href={`https://phonetool.amazon.com/users/${gobj.user.slice(
                                    15
                                  )}`}
                                  target="_blank"
                                >
                                  {gobj.user.slice(15)}
                                </a>
                                {/* <br/> */}
                                {/* <br/> */}
                                {/* {gobj.created_at.slice(0,-5)} */}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.customer}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.service}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.claim}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.winloss}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.priority}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {gobj.serviceteam}
                              </TableCell>
                              <TableCell fontSize="var(--amplify-font-sizes-small)">
                                {/* If user equals user.username */}
                                {/* Production */}
                                {gobj.user == user.username ? (
                                  <>
                                    <div>
                                      <Button onClick={() => change({ gobj })}>
                                        EDIT
                                      </Button>
                                    </div>
                                    <div className="deletIconDiv">
                                      <AiTwotoneDelete
                                        className="deleteIcon"
                                        onDoubleClick={() =>
                                          deleteGobj({ gobj })
                                        }
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </>
                    ))
                  ) : (
                    <>
                      <TableRow>
                        <TableCell colSpan="8">
                          There is no data in this dashboard.
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </ThemeProvider>
          </div>
        </>
      ) : (
        <>
          {/* To be shown when the user is not signed in */}
          <Alert variation="info">Please sign-in to view the dashboard.</Alert>
          <div className="signInAndOutDiv">
            <Button
              backgroundColor={tokens.colors.pink[40]}
              onClick={() =>
                Auth.federatedSignIn({ customProvider: "AmazonFederate" })
              }
              className="signInAndOut"
            >
              Sign-In with Midway
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
