import React, { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from "axios";
import useAppStore from '@/store/appStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next-nprogress-bar';
import { deleteCookie } from "cookies-next";
import { signOut } from "next-auth/react";
import useSlug from "@/app/scale/layout/hooks/useSlug";
import { useSession } from "next-auth/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const schema = yup.object().shape({
    teamName: yup.string().required('Please enter name.'),
});

const CreateEvent = () => {
    const router = useRouter();
    const baseURL = '/api/';
    const { updateIsTeamDrawer, sessionData, userId, updateTeamList, updateIsBacklogUpdated, isBacklogUpdated, isTeamDrawer } = useAppStore();
    const [localForm, setLocalForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState(null);
    const { projectName, slug, key } = useSlug();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const { data: session } = useSession();
    const dateFormat = session?.data?.dateFormat;
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { projectList } = useAppStore();
    const [projects, setProjects] = useState("");
    const [currentSlug, setCurrentSlug] = useState(slug);
    const [currentKey, setCurrentKey] = useState(key);
    useEffect(() => {
        setProjects(projectList);
    }, [projectList]);

    useEffect(() => {
        // console.log('isTeamDrawer ', isTeamDrawer);
        if (isTeamDrawer !== true && isTeamDrawer !== false) {
            getData();
        }
    }, [isTeamDrawer]);

    const getData = async () => {
        let posturl = baseURL + "team?id=" + isTeamDrawer;
        await axios
            .get(posturl)
            .then((res) => {
                // console.log('team ', res?.data[0]);
                setRows(res?.data[0]);
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 401) {
                    deleteCookie("logged");
                    signOut();
                }
            });
    };

    useEffect(() => {
        getMasterData();
    }, []);

    useEffect(() => {
        reset(rows ? rows : {});
        if (rows) {
            setSelectedDate(rows);
        }
    }, [rows]);

    const getMasterData = async () => {
        let posturl = baseURL + "teammaster";
        await axios
            .get(posturl)
            .then((res) => {
                setLocalForm(res?.data[0]?.teams);
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

    const getTeam = async () => {
        let posturl = baseURL + `team?slug=${slug}`;
        await axios
            .get(posturl)
            .then((res) => {
                // console.log('team ', res?.data);
                updateTeamList(res?.data);
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 401) {
                    deleteCookie("logged");
                    signOut();
                }
            });
    };

    const handleDropdownChange = (e, fieldName) => {
        if (fieldName === 'projectName') {
            if (projectList) {
                let inputVal = e.target.value;
                console.log('projectName ', inputVal);
                const project = projectList.find(proj => proj.projectName === inputVal);
                let pSlug = project?.projectSlug || '';
                let pKey = project?.projectKey || '';
                setCurrentSlug(pSlug);
                setCurrentKey(pKey);
            }
        }
    };

    const onSubmit = async (data) => {
        Object.assign(data, { userId: userId });
        Object.assign(data, { projectSlug: currentSlug });
        // Object.assign(data, { projectName: projectName });
        Object.assign(data, { updatedAt: Date.now() });
        Object.assign(data, { lastModifiedBy: sessionData.data.email });

        try {
            const endpoint = baseURL + `team?slug=${slug}`;
            let method;

            if (rows) {
                Object.assign(data, { userId: userId });
                Object.assign(data, { oldName: rows.name });
                method = "put";
                const { data: responseData } = await axios[method](endpoint, data);
                // console.log('responseData ', responseData);
                // updateTeamList(responseData);
                getTeam();
            } else {
                Object.assign(data, { createdBy: sessionData.data.fullName });
                Object.assign(data, { userId: userId });
                method = "post";
                const { _id, ...newData } = data;
                const { data: responseData } = await axios[method](endpoint, newData);
                // updateTeamList(responseData);
                getTeam();
            }

            const successMessage = rows ? 'Record modified successfully!' : 'Record added successfully!';
            toast.success(successMessage, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                toastId: 'success',
                theme: "light",
                style: {
                    width: '380px',
                },
            });
            updateIsBacklogUpdated(!isBacklogUpdated)
            updateIsTeamDrawer(false);
        } catch (error) {
            handleApiError(error);
        }
    };

    const handleApiError = (error) => {
        const errorMessage =
            error.status === 401 || error.status === 403 || error.status === 500
                ? error
                : "Sorry....the backend server is down!! Please try again later";

        if (error?.response?.data?.error) {
            setError('teamName', { type: 'custom', message: error.response.data.error });
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


    const renderFormField = (field) => {
        if (field.quickAdd) {
            switch (field.type) {
                case 'project':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-600">
                                {field.label}
                            </label>
                            <select
                                id={field.name}
                                name={field.name}
                                disabled
                                {...register(field.name)}
                                onChange={(e) => handleDropdownChange(e, field.name)}
                                className={`scaleform ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value={projectName}>{projectName}</option>
                                {projects !== null && projects !== undefined && projects.filter(name => name.projectName !== projectName).map((option, index) => (
                                    <option key={index} value={option.projectName}>
                                        {option.projectName}
                                    </option>
                                ))}
                            </select>
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                            )}
                        </div>
                    );
                case 'dropdown':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-600">
                                {field.label}
                            </label>
                            <select
                                id={field.name}
                                name={field.name}
                                disabled={field.readOnly}
                                {...register(field.name)}
                                className={`scaleform ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">

                                </option>
                                {field.optionList.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                            )}
                        </div>
                    );
                case 'textbox':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm text-gray-600 font-semibold">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                id={field.name}
                                disabled={field.readOnly}
                                name={field.name}
                                {...register(field.name)}
                                className={`scaleform ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                            )}
                        </div>
                    );
                case 'textarea':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-600">
                                {field.label}
                            </label>
                            <textarea
                                id={field.name}
                                name={field.name}
                                disabled={field.readOnly}
                                {...register(field.name)}
                                rows="3"
                                className={`scaleform ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            ></textarea>
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                            )}
                        </div>
                    );
                case 'list':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-600">
                                {field.label}
                            </label>
                            <textarea
                                rows="1"
                                id={field.name}
                                name={field.name}
                                disabled={field.readOnly}
                                {...register(field.name)}
                                placeholder={`tag1,tag2,tag3 (Add tags as a comma separated list)`}
                                className={`scaleform ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            ></textarea>
                        </div>
                    );
                case 'date':
                    return (
                        <div className="mb-4" key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-600">
                                {field.label}
                            </label>
                            <DatePicker
                                id={field.name}
                                name={field.name}
                                selected={selectedDate[field.name]}
                                onChange={(date) => { handleDateChange(date, field.name) }}
                                dateFormat={dateFormat}
                                autoComplete="off"
                                disabled={field.readOnly}
                                className={`scaleform max-w-[550px] min-w-[550px] ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors[field.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[field.name].message}</p>
                            )}
                        </div>
                    );
                default:
                    return null;
            }
        }
    };

    return (
        <>
            <div className="rounded overflow-hidden">
                <div style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="sticky top-0 bg-slate-100 z-10">
                            <div>
                                <IconButton onClick={() => { updateIsTeamDrawer(false) }} edge="start" color="inherit" aria-label="close">
                                    <CloseRoundedIcon className="ml-4" />
                                </IconButton>
                            </div>
                            <div className="flex justify-center text-lg font-semibold -mt-5">
                                {rows ? 'Edit Team' : 'Add Team'}
                            </div>
                            <div className="flex justify-end text-sm -mt-7">
                                <div
                                    className="pulsebuttonwhite px-3 mr-4"
                                    onClick={() => {
                                        router.push("../team/team");
                                    }}
                                >
                                    <span>
                                        <EditIcon className="text-slate-600" sx={{ fontSize: "20px" }} />
                                    </span>
                                    <span>редагуввати команду</span>
                                </div>
                            </div>
                            <Divider />
                        </div>
                        <div className="flex justify-center mt-4 min-h-[86vh]">
                            <div className="max-w-[550px] min-w-[550px]">
                                {!loading ? (
                                    <>
                                        {localForm.map((field) => renderFormField(field))}
                                    </>
                                ) : (
                                    <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                                        <svg ariaHidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                                        <span className="sr-only">Завантаження...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-slate-100 z-10 min-h-[60px]">
                            <Divider />
                            <div className="mt-3 mb-3">
                                <div className="flex justify-end mr-4">
                                    <div>
                                        <div className="flex">
                                            <button onClick={() => updateIsTeamDrawer(false)}
                                                className="pulsebuttonwhite mr-3  min-w-[140px]"
                                            >
                                                <span>Скасувати</span>
                                            </button>
                                            <button
                                                type="submit"
                                                className="pulsebuttonblue min-w-[140px]"
                                            >
                                                Зберегти
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div >
            </div>
        </>
    );
};

export default CreateEvent;
