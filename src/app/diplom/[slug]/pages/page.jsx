"use client";
import Layout from "@/app/scale/layout/layout";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { deleteCookie } from "cookies-next";
import Skeleton from '@mui/material/Skeleton';
import axios from "axios";
import useAppStore from '@/store/appStore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TableView from "@/common/tableView";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next-nprogress-bar';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Breadcrumb from '@/app/scale/layout/breadcrumb';
import useSlug from "@/app/scale/layout/hooks/useSlug";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

export default function Page() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uiloading, seUiLoading] = useState(true);
    const { updateViewMode, updateFormData, updatePageList } = useAppStore();
    const { rowSelection } = useAppStore();
    const { pageList, updatePagemaster } = useAppStore();
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const baseURL = '/api/';
    const { projectName, slug, key } = useSlug();
    const { sessionData, userId } = useAppStore();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        updateViewMode('Table');
        updateFormData(null);
        getiForm();
    }, []);

    useEffect(() => {
        setRows(pageList);
    }, [pageList]);

    useEffect(() => {
        seUiLoading(false);
    }, [uiloading]);

    const getiForm = async () => {
        let posturl = baseURL + "pagemaster";

        try {
            const response = await axios.get(posturl);
            updatePagemaster(response?.data[0]?.pages);
            getData();
        } catch (error) {
            console.error("Error", error);
        }
    };


    useEffect(() => {
        if (rowSelection !== undefined && rowSelection.length > 0) {
            setRowSelectionModel(rowSelection);
        } else {
            setRowSelectionModel([]);
        }
    }, [rowSelection]);


    const getData = async () => {
        let posturl = baseURL + `page?slug=${slug}`;
        await axios
            .get(posturl)
            .then((res) => {
                setRows(res?.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 401) {
                    deleteCookie("logged");
                    signOut();
                }
            });
    };


    const createNewPage = async () => {
        setDisabled(true);
        try {
            const endpoint = baseURL + `page`;
            let data = {};
            Object.assign(data, { userId: userId });
            Object.assign(data, { projectSlug: slug });
            Object.assign(data, { projectName: projectName });
            Object.assign(data, { updatedAt: Date.now() });
            Object.assign(data, { lastModifiedBy: sessionData.data.email });
            Object.assign(data, { createdBy: sessionData.data.fullName });
            const method = "post";
            const { _id, ...newData } = data;
            const { data: responseData } = await axios[method](endpoint, newData);
            getPages();
            // console.log('New page response ', responseData);
            const pageSlug = responseData;
            router.push('/scale/' + slug + '/pages/' + pageSlug + '?edit=true');
        } catch (error) {
            handleApiError(error);
        }
    }

    const getPages = async () => {
        let posturl = baseURL + "page";

        try {
            const response = await axios.get(posturl);
            updatePageList(response.data);

        } catch (error) {
            console.log(error);
            if (error.response.status === 401) {
                deleteCookie("logged");
                signOut();
            }
        }
    };

    const handleApiError = (error) => {
        const errorMessage =
            error.status === 401 || error.status === 403 || error.status === 500
                ? error
                : "Sorry....the backend server is down!! Please try again later";

        if (error?.response?.data?.error) {
            setError('summary', { type: 'custom', message: error.response.data.error });
        } else {
            toast.error(errorMessage, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                style: {
                    width: '380px',
                },
            });
        }

        console.log(error);
    };

    const handleDelete = () => {
        confirmAlert({
            title: 'Confirm to submit',
            message: 'are you sure to delete this record?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => deleteRow()
                },
                {
                    label: 'No',
                }
            ]
        });
    };

    const deleteRow = () => {
        let config = {
            method: 'delete',
            url: baseURL + 'page',
            data: rowSelectionModel
        };

        axios.request(config)
            .then(response => {
                setRowSelectionModel([]);
                toast.success('Record deleted successfully!', {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    style: {
                        width: '380px',
                    },
                });
                getData();
            })
            .catch(err => {
                console.log('Error ', err);
                toast.error(err, {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    style: {
                        width: '380px',
                    },
                });
            })
    }


    return (
        <Layout>
            {!uiloading && (
                <>
                    <Breadcrumb project={projectName} page="Pages" slug={slug} />
                    <div>
                        <div className="mt-10">
                            <div className="hover:bg-blue-100 hover:rounded-md max-w-[50px]">
                                <div
                                    className="px-3 py-1 mr-1 text-blue-600 cursor-pointer"
                                    onClick={() => {
                                        router.back();
                                    }}
                                >
                                    <KeyboardBackspaceIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex justify-end -mb-6">
                                {disabled ? (
                                    <div
                                        className="pulsebuttonblue px-3 py-2 mr-1"
                                        style={{ opacity: 0.5, pointerEvents: 'none' }}
                                    >
                                        <span>Створити нову сторінку</span>
                                        <svg ariaHidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                ) :
                                    (
                                        <div
                                            className="pulsebuttonblue px-3 py-1 mr-1"
                                            onClick={() => createNewPage()}
                                        >
                                            <AddCircleOutlineIcon className="w-5 h-5" />
                                            <span className="-mt-1">Create new page</span>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="flex justify-between mt-7">
                            <div className="mt-5">
                                <div className="flex">
                                    {rowSelectionModel.length > 0 && (
                                        <div className="mr-2">
                                            <button
                                                className="pulsebuttonwhite px-3 py-1 mr-1"
                                                onClick={() => handleDelete()}
                                            >
                                                <DeleteOutlineIcon className="w-5 h-5" sx={{ fontSize: "16px" }} />
                                                <span className="text-sm">Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!loading ? (
                            <div>
                                {rows !== undefined && (
                                    <>
                                        <TableView rows={rows} from="page" parent="pages" />
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Skeleton className="mt-4" variant="rounded" width="100%" height={90} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                                <Skeleton className="mt-1" variant="rounded" width="100%" height={50} />
                            </>
                        )}
                    </div>
                </>
            )}
        </Layout>
    );
}